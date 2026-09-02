# O*NET 임포트

직군·직무별 요구 역량 중요도를 실측 데이터로 채웁니다.

## 왜 필요한가

`data/roles/families.ts` 의 `competencies` 는 지금 전부 `provisional` —
근거 없이 손으로 적은 값입니다. 화면에도 "잠정값"이라고 표시됩니다.

O*NET(미국 노동부)은 직업 약 900개에 대해 요소별 중요도를 실측해 공개합니다.
그 값을 우리 능력치 30개로 환산해 넣으면 출처가 `onet` 으로 올라갑니다.

## 하는 법

1. https://www.onetcenter.org/database.html 에서 **텍스트 배포판**을 받습니다.
   라이선스 동의가 필요해서 사람이 직접 받아야 합니다.

2. 압축을 풀고 아래 세 파일을 `scripts/onet/data/` 에 넣습니다.

   ```
   Work Styles.txt
   Abilities.txt
   Skills.txt
   ```

   셋 다 없어도 됩니다. 있는 파일이 채우는 능력치만 실측치로 바뀌고
   나머지는 provisional 로 남습니다.

3. 실행합니다.

   ```
   npx tsx scripts/onet/import.ts
   ```

4. `data/roles/onet-competencies.generated.ts` 가 생깁니다.
   앱은 이 파일이 있으면 자동으로 씁니다. 다시 빌드하면 반영됩니다.

## 매핑을 고치려면

`scripts/onet/crosswalk.ts` 만 고치고 임포트를 다시 돌리면 됩니다.
어떤 O*NET 요소가 우리 능력치 몇 %를 설명하는지 적어 둔 표입니다.
이 표 자체는 사람의 판단이라 코드에 두고 검토할 수 있게 했습니다.

## 대응이 없는 능력치

아래 셋은 O*NET 에 해당 구성개념이 없어서 임포트 후에도 provisional 로
남습니다. 비슷한 요소를 억지로 갖다 붙이면 "실측치"라는 이름표만 붙고
근거는 여전히 없는 상태가 됩니다.

| 능력치 | 이유 |
|---|---|
| 직관력 | O*NET 에 해당 구성개념이 없음 |
| 심미안 | Artistic 흥미는 있으나 역량 요소가 아님 |
| 성장가능성 | 현재 직무 요구가 아니라 미래 예측 |

## 커밋하지 않습니다

`scripts/onet/data/` 와 생성 파일은 `.gitignore` 에 있습니다.
O*NET 배포판에서 파생된 값이고, 라이선스 조건은 받는 쪽에서
확인해야 하기 때문입니다.
