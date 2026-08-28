import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * tailwind-merge는 `text-*` 를 볼 때 크기인지 색인지 이름으로 판별한다.
 * 판별 기준이 티셔츠 사이즈(xs/sm/md/lg/2xl…)라서, 우리 스케일의
 * `text-small`·`text-body`·`text-h2` 같은 이름은 크기로 인식되지 못하고
 * 색상 그룹으로 떨어진다. 그러면 한 요소에 크기와 색을 같이 주는 순간
 * 뒤에 온 쪽이 앞을 지워버린다 — 검은 버튼에 글자가 사라지는 식으로.
 *
 * 그래서 우리 스케일을 명시적으로 등록한다. 이름을 티셔츠 사이즈로
 * 되돌리는 대신 이 설정을 두는 이유는, 스케일 이름이 곧 용도(body, h2)라
 * 마크업에서 무엇을 쓰는지가 드러나기 때문이다.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['micro', 'tiny', 'small', 'body', 'lead', 'h4', 'h3', 'h2', 'h1', 'display'] },
      ],
      rounded: [{ rounded: ['card', 'control', 'pill'] }],
      shadow: [{ shadow: ['e1', 'e2', 'e3', 'glow'] }],
      p: [{ p: ['pad-i', 'pad-b'] }],
      px: [{ px: ['pad-i', 'pad-b'] }],
      py: [{ py: ['pad-i', 'pad-b'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
