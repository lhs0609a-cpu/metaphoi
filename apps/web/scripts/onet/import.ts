/**
 * O*NET 임포트
 * ============================================================================
 *
 * 쓰는 법
 *
 *   1. https://www.onetcenter.org/database.html 에서 텍스트 배포판을 받는다
 *      (라이선스 동의가 필요하고, 사람이 직접 받아야 한다)
 *   2. 아래 세 파일을 scripts/onet/data/ 에 넣는다
 *        Work Styles.txt
 *        Abilities.txt
 *        Skills.txt
 *   3. npx tsx scripts/onet/import.ts
 *
 * 무엇을 하나
 *
 *   직군(families.ts)마다 적어 둔 onetCode 로 해당 직업의 요소별 중요도를
 *   찾아, crosswalk.ts 의 표에 따라 우리 능력치 30개로 환산한다.
 *   결과를 data/roles/onet-competencies.generated.ts 에 쓴다.
 *
 * 왜 families.ts 를 직접 고치지 않나
 *
 *   생성물과 손으로 쓴 것을 같은 파일에 섞으면, 다시 임포트할 때 사람이
 *   고친 부분이 지워지거나 병합 충돌이 난다. 생성물은 별도 파일에 두고
 *   런타임에서 합친다. 그러면 파일 이름만 봐도 어느 쪽이 실측인지 안다.
 *
 * 없는 파일은 없는 대로 둔다
 *
 *   세 파일 중 일부만 있어도 돌아간다. 그 경우 해당 파일이 채우는
 *   능력치만 provisional 로 남는다. 전부 있어야 돌아가게 만들면
 *   부분적으로라도 근거를 붙일 기회를 잃는다.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { CROSSWALK, UNMAPPED, normalizeImportance } from './crosswalk';
import { JOB_FAMILIES } from '../../data/roles/families';
import { JOB_ROLES } from '../../data/roles/roles';
import type { AbilityKey } from '../../data/roles/types';

const DATA_DIR = path.join(__dirname, 'data');
const OUT_FILE = path.join(__dirname, '../../data/roles/onet-competencies.generated.ts');

const FILES: Record<string, string[]> = {
  work_styles: ['Work Styles.txt', 'Work_Styles.txt'],
  abilities: ['Abilities.txt'],
  skills: ['Skills.txt'],
};

/** O*NET-SOC 코드 → { elementId → importance(1~5) } */
type ImportanceIndex = Map<string, Map<string, number>>;

function findFile(candidates: string[]): string | null {
  for (const name of candidates) {
    const p = path.join(DATA_DIR, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * O*NET 텍스트 파일을 읽는다.
 *
 * 탭 구분에 첫 줄이 헤더다. 컬럼 순서가 배포판마다 조금씩 다르므로
 * 위치가 아니라 헤더 이름으로 찾는다 — 위치로 읽으면 다음 배포판에서
 * 조용히 엉뚱한 값을 읽는다.
 */
function readImportance(filePath: string): ImportanceIndex {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return new Map();

  const header = lines[0].split('\t').map((h) => h.trim());
  const col = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

  const iSoc = col('O*NET-SOC Code');
  const iElement = col('Element ID');
  const iScale = col('Scale ID');
  const iValue = col('Data Value');

  if (iSoc < 0 || iElement < 0 || iScale < 0 || iValue < 0) {
    throw new Error(
      `${path.basename(filePath)}: 필요한 컬럼을 찾지 못했습니다. ` +
        `헤더: ${header.slice(0, 8).join(' | ')}`
    );
  }

  const index: ImportanceIndex = new Map();

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('\t');
    // Importance 만 쓴다. Level 은 "얼마나 높은 수준이 필요한가"라
    // 우리가 알고 싶은 것과 다르다.
    if (cells[iScale]?.trim() !== 'IM') continue;

    const soc = cells[iSoc]?.trim();
    const element = cells[iElement]?.trim();
    const value = Number(cells[iValue]);
    if (!soc || !element || Number.isNaN(value)) continue;

    if (!index.has(soc)) index.set(soc, new Map());
    index.get(soc)!.set(element, value);
  }

  return index;
}

/** O*NET-SOC 코드는 15-1252.00 형태다. 뒤 두 자리가 없거나 다를 수 있어 앞부분으로도 찾는다 */
function lookup(index: ImportanceIndex, code: string): Map<string, number> | null {
  if (index.has(code)) return index.get(code)!;
  const base = code.split('.')[0];
  let found: Map<string, number> | null = null;
  index.forEach((map, soc) => {
    if (!found && soc.split('.')[0] === base) found = map;
  });
  return found;
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`\n데이터 디렉터리가 없습니다: ${DATA_DIR}`);
    console.error('O*NET 텍스트 배포판을 받아 그 안에 넣어 주세요.');
    console.error('https://www.onetcenter.org/database.html\n');
    process.exit(1);
  }

  const indexes: Partial<Record<string, ImportanceIndex>> = {};
  const missing: string[] = [];

  for (const [key, candidates] of Object.entries(FILES)) {
    const file = findFile(candidates);
    if (!file) {
      missing.push(candidates[0]);
      continue;
    }
    indexes[key] = readImportance(file);
    console.log(`읽음  ${path.basename(file)} — 직업 ${indexes[key]!.size}개`);
  }

  if (missing.length > 0) {
    console.log(`\n없는 파일: ${missing.join(', ')}`);
    console.log('해당 파일이 채우는 능력치는 provisional 로 남습니다.\n');
  }

  if (Object.keys(indexes).length === 0) {
    console.error('읽을 수 있는 파일이 하나도 없습니다.');
    process.exit(1);
  }

  // 직군과 직무 각각의 onetCode 를 모은다
  const targets = new Map<string, string>();
  JOB_FAMILIES.forEach((f) => {
    if (f.onetCode) targets.set(`family:${f.id}`, f.onetCode);
  });
  JOB_ROLES.forEach((r) => {
    if (r.onetCode) targets.set(`role:${r.id}`, r.onetCode);
  });

  const result: Record<string, Partial<Record<AbilityKey, number>>> = {};
  const notFound: string[] = [];

  const targetList: [string, string][] = [];
  targets.forEach((socCode, id) => targetList.push([id, socCode]));

  for (const [id, socCode] of targetList) {
    // 능력치별로 (가중치 × 값) 과 가중치 합을 모은다
    const num: Partial<Record<AbilityKey, number>> = {};
    const den: Partial<Record<AbilityKey, number>> = {};
    let matchedAny = false;

    for (const entry of CROSSWALK) {
      const index = indexes[entry.file];
      if (!index) continue;
      const row = lookup(index, socCode);
      if (!row) continue;
      const raw = row.get(entry.elementId);
      if (raw === undefined) continue;

      matchedAny = true;
      const v = normalizeImportance(raw);
      num[entry.target] = (num[entry.target] ?? 0) + v * entry.weight;
      den[entry.target] = (den[entry.target] ?? 0) + entry.weight;
    }

    if (!matchedAny) {
      notFound.push(`${id} (${socCode})`);
      continue;
    }

    const competencies: Partial<Record<AbilityKey, number>> = {};
    (Object.keys(num) as AbilityKey[]).forEach((k) => {
      const d = den[k];
      if (d && d > 0) competencies[k] = Math.round(num[k]! / d);
    });

    result[id] = competencies;
  }

  if (notFound.length > 0) {
    console.log(`\nO*NET 에서 찾지 못한 항목 ${notFound.length}개:`);
    notFound.slice(0, 12).forEach((n) => console.log(`  ${n}`));
    if (notFound.length > 12) console.log(`  … 외 ${notFound.length - 12}개`);
    console.log('이 항목들은 기존 provisional 값을 그대로 씁니다.\n');
  }

  const generated = `/* 자동 생성 — 직접 고치지 마세요.
 *
 * scripts/onet/import.ts 가 O*NET 배포판에서 만들어낸 파일입니다.
 * 매핑을 바꾸려면 scripts/onet/crosswalk.ts 를 고치고 임포트를 다시 돌리세요.
 *
 * 생성 시각: ${new Date().toISOString()}
 * 대상: ${Object.keys(result).length}개
 * 대응 요소가 없어 provisional 로 남는 능력치: ${UNMAPPED.join(', ')}
 */
import type { AbilityKey } from './types';

export const ONET_COMPETENCIES: Record<string, Partial<Record<AbilityKey, number>>> =
${JSON.stringify(result, null, 2)};
`;

  fs.writeFileSync(OUT_FILE, generated, 'utf8');

  console.log(`\n생성 완료: ${path.relative(process.cwd(), OUT_FILE)}`);
  console.log(`  ${Object.keys(result).length}개 항목에 실측 중요도를 붙였습니다.`);
  console.log(`  ${UNMAPPED.length}개 능력치는 O*NET 대응이 없어 provisional 로 남습니다.`);
  console.log(`\n다음: data/roles/families.ts 의 competencySource 를 'onet' 으로 바꾸지 마세요.`);
  console.log(`      런타임에서 생성 파일이 있으면 자동으로 onet 으로 표시됩니다.`);
}

main();
