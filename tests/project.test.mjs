import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root,name), 'utf-8');
const html = read('index.html');
const css = read('style.css');
const js = read('game.js');

const ids = [...js.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);

test('index có tiêu đề, liên kết CSS/JS và canvas', () => {
  assert.match(html,/NẤM LÙN/);
  for (const asset of ['style.css','game.js','manifest.webmanifest','icon.svg']) {
    assert.ok(html.includes(asset), `index thiếu ${asset}`);
    assert.ok(fs.existsSync(path.join(root,asset)), `tệp không tồn tại: ${asset}`);
  }
  assert.match(html, /id="game-canvas"/);
});

test('ID DOM được JS truy cập phải tồn tại trong HTML', () => {
  const missing = [...new Set(ids)].filter(id => !new RegExp(`id=["']${id}["']`).test(html));
  assert.deepEqual(missing, []);
});

test('manifest hợp lệ, hỗ trợ landscape và icon', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.orientation,'landscape');
  assert.equal(manifest.lang,'vi');
  assert.ok(manifest.icons?.length > 0);
});

test('game giữ save legacy key và có cơ chế 3 mức khó', () => {
  assert.ok(js.includes('nam-lun-phieu-luu-save-v1'));
  assert.ok(js.includes('difficulty'));
  for (const mode of ['story','challenge','nightmare']) assert.ok(js.includes(mode));
  assert.ok(js.includes('screen.orientation.lock'));
  assert.ok(css.includes('force-landscape'));
});

test('game dùng Three.js khóa phiên bản và có vùng theo cấp', () => {
  assert.ok(js.includes('three@0.187.0'));
  for (const name of ['Làng Nấm Ánh Sao','Rừng Đom Đóm','Đầm Pha Lê']) assert.ok(js.includes(name));
});
