import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";

const cwd = new URL("../", import.meta.url).pathname;
const server = spawn("python3", ["-m", "http.server", "5173", "--bind", "127.0.0.1"], {cwd, stdio:"ignore"});
const chrome = spawn("chromium", ["--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required", "--remote-debugging-port=9229", "--user-data-dir=/tmp/rythmes-cdp-profile", "about:blank"], {stdio:"ignore"});
let socket;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run() {
  let pages;
  for (let i = 0; i < 30; i++) {
    try {
      pages = await (await fetch("http://127.0.0.1:9229/json/list")).json();
      if (pages.find(p => p.type === "page")) break;
    } catch (_) {}
    await sleep(120);
  }
  const page = pages?.find(p => p.type === "page");
  assert.ok(page, "Chromium CDP not available");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, {once:true}); socket.addEventListener("error",reject,{once:true}); });
  let id = 0;
  const pending = new Map();
  const exceptions = [];
  socket.addEventListener("message", e => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === "Runtime.exceptionThrown") exceptions.push(msg.params.exceptionDetails.text);
  });
  const send = (method, params={}) => new Promise((resolve,reject) => {
    const seq = ++id;
    pending.set(seq, result => result.error ? reject(new Error(JSON.stringify(result.error))) : resolve(result.result));
    socket.send(JSON.stringify({id:seq,method,params}));
  });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", {expression, returnByValue:true, userGesture:true, awaitPromise:true});
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", {url:"http://127.0.0.1:5173/"});
  await sleep(800);
  assert.equal(await evaluate("document.querySelectorAll('.orbit-step').length"), 60);
  assert.equal(await evaluate("document.querySelectorAll('.track-card').length"), 4);
  assert.equal(await evaluate("document.querySelector('#playText').textContent"), "Écouter");
  await evaluate("document.querySelector('#playButton').click()");
  await sleep(250);
  assert.equal(await evaluate("document.querySelector('#playText').textContent"), "Arrêter", "AudioContext did not start");
  await evaluate("document.querySelector('#tempoSlider').value='133';document.querySelector('#tempoSlider').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.querySelector('#tempoNumber').value"), "133");
  await evaluate("document.querySelector('#addTrack').click()");
  assert.equal(await evaluate("document.querySelectorAll('.track-card').length"), 5);
  await evaluate("document.querySelector('.orbit-step').click()");
  assert.ok(await evaluate("JSON.parse(localStorage.getItem('rythmes.studio.v2')).tracks.length===5"));
  await evaluate("document.querySelector('.track-card [data-action=remove]').click()");
  assert.equal(await evaluate("document.querySelectorAll('.track-card').length"), 4);
  await evaluate("document.querySelector('.track-card [data-action=mute]').click()");
  assert.equal(await evaluate("document.querySelector('.track-mute').getAttribute('aria-pressed')"), "true");
  await evaluate("document.querySelector('#playButton').click()");
  assert.equal(await evaluate("document.querySelector('#playText').textContent"), "Écouter");
  await send("Page.reload", {ignoreCache:true});
  await sleep(600);
  assert.equal(await evaluate("document.querySelector('#tempoNumber').value"), "133", "Saved tempo did not reload");
  assert.equal(await evaluate("document.querySelector('#volumeSlider').value"), "74", "Saved volume did not reload");
  const shot = await send("Page.captureScreenshot", {format:"png"});
  writeFileSync("/tmp/rythmes-interactions.png", Buffer.from(shot.data,"base64"));
  await send("Emulation.setDeviceMetricsOverride", {width:390,height:844,deviceScaleFactor:1,mobile:true});
  await sleep(200);
  assert.ok(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "Mobile layout overflows horizontally");
  const mobileShot = await send("Page.captureScreenshot", {format:"png"});
  writeFileSync("/tmp/rythmes-mobile.png", Buffer.from(mobileShot.data,"base64"));
  assert.deepEqual(exceptions, [], "JavaScript runtime exceptions");
  console.log("PASS browser: render, audio start/stop, tempo, add/delete, steps, mute, localStorage reload");
}
run().then(() => process.exitCode=0).catch(err => {console.error(err);process.exitCode=1;}).finally(() => {socket?.close();chrome.kill();server.kill();});
