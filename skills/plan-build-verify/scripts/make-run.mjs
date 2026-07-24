#!/usr/bin/env node
// make-run.mjs — plan-build-verify 웨이브에 "실제 업무 이름"을 붙인 런 스크립트를 만든다.
//
// 왜: Workflow의 meta는 순수 리터럴이라 args로 동적 생성이 안 된다(name: A.task 금지).
//     그래서 workflow.js를 그대로 복사하되 meta.name/description만 실제 업무명으로 치환한
//     "런 스크립트"를 만들고, 그 경로를 scriptPath로 띄우면 /workflows 목록과 완료 통지에
//     'plan-build-verify'가 아니라 그 웨이브가 실제로 하는 업무가 보인다.
//     동작은 workflow.js와 100% 동일(파이프라인·args·resume/journal 의미론 그대로).
//
// 사용법:
//   node <skill>/scripts/make-run.mjs "<업무 타이틀>" "<한 줄 설명>" [출력경로]
//   - 출력경로 생략 시 OS 임시 디렉터리에 만든다(Workflow resume은 동일 세션 한정이라 tmp로 충분).
//   - stdout으로 생성된 런 스크립트 경로 한 줄을 출력한다 → 그 값을 Workflow scriptPath로 쓴다.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const [title, desc, outArg] = process.argv.slice(2)
if (!title || !desc) {
  console.error('usage: node make-run.mjs "<업무 타이틀>" "<한 줄 설명>" [출력경로]')
  process.exit(1)
}

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', 'workflow.js')
let code = readFileSync(src, 'utf8')

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ')

// meta 블록의 첫 name:/description: 리터럴만 치환한다(meta는 파일 상단, 첫 등장이 meta의 것).
const before = code
code = code.replace(/(export const meta = \{[\s\S]*?\bname:\s*)'(?:[^'\\]|\\.)*'/, `$1'${esc(title)}'`)
code = code.replace(/(export const meta = \{[\s\S]*?\bdescription:\s*)'(?:[^'\\]|\\.)*'/, `$1'${esc(desc)}'`)
if (code === before || !code.includes(`'${esc(title)}'`)) {
  console.error('make-run: meta.name/description 치환 실패 — workflow.js의 meta 형식이 바뀌었는지 확인하라.')
  process.exit(2)
}

const slug =
  title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'run'
const stamp = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`
const out = outArg || join(tmpdir(), `pbv-runs`, `${slug}-${stamp}.js`)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, code)
console.log(out)
