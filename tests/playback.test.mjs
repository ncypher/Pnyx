import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readingTime,mergeQueue} from '../scene/playback.mjs';

test('opening is readable and long replies receive proportional time',()=>{
 assert.equal(readingTime('Hello.'),10000);
 assert.equal(readingTime(Array(120).fill('word').join(' ')),50500);
 assert.ok(readingTime('word '.repeat(100),'relaxed')>readingTime('word '.repeat(100),'standard'));
});
test('second arrival preserves the first subtitle and does not duplicate it',()=>{
 const first={id:0,text:'first'},second={id:1,text:'second'};
 const merged=mergeQueue([first],[first,second],true);
 assert.deepEqual(merged,[first,second]);
 assert.equal(merged[0],first);
 assert.deepEqual(mergeQueue(merged,[second],true),merged);
 assert.deepEqual(mergeQueue(merged,[{id:2}],false),[{id:2}]);
});
