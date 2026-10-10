import test from "node:test";
import assert from "node:assert/strict";
import { RhythmEngine } from "../audio-engine.js";
import { barDuration, euclidean } from "../rhythm.js";

test("one shared clock schedules 3 and 5 steps without duplicate events", () => {
  const tracks = [
    {id:"three", instrument:"kick", steps:3, pattern:euclidean(3,3), muted:false},
    {id:"five", instrument:"tom", steps:5, pattern:euclidean(5,5), muted:false}
  ];
  const state = {bpm:120,tracks};
  const engine = new RhythmEngine(() => state, () => {}, () => {});
  const context = {currentTime:9.99,state:"running"};
  engine.context = context;
  engine.playing = true;
  engine.barStart = 10;
  engine.duration = barDuration(120);
  engine.cursors.clear();
  const events = [];
  engine.playSound = (instrument,time) => events.push({instrument,time});
  for (let tick=0; tick<=240; tick++) {
    context.currentTime = 9.99 + tick*0.01;
    engine.schedule();
  }
  const close = (value,expected) => assert.ok(Math.abs(value-expected)<1e-6, value+" expected "+expected);
  const three = events.filter(e=>e.instrument==="kick").map(e=>e.time);
  const five = events.filter(e=>e.instrument==="tom").map(e=>e.time);
  assert.equal(new Set(three).size,three.length);
  assert.equal(new Set(five).size,five.length);
  for (let i=0;i<3;i++) close(three[i],10+i*2/3);
  for (let i=0;i<5;i++) close(five[i],10+i*2/5);
  close(three[3],12);
  close(five[5],12);
});

test("tempo changes are applied at shared bar boundaries", () => {
  const state={bpm:120,tracks:[{id:"a",instrument:"kick",steps:4,pattern:[true,true,true,true],muted:false}]};
  const engine=new RhythmEngine(()=>state,()=>{},()=>{});
  engine.context={currentTime:10,state:"running"};
  engine.playing=true;
  engine.barStart=10;
  engine.duration=barDuration(120);
  engine.playSound=()=>{};
  for(let i=0;i<=200;i++){
    engine.context.currentTime=10+i*.01;
    if(i===170)state.bpm=60;
    engine.schedule();
  }
  assert.equal(engine.barStart,12);
  assert.equal(engine.duration,4);
});
