import { Surface } from '@/components/layouts/surface';
import { MinimalHeader } from '@/components/layouts/minimal-header';

export default function SharedResultsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Surface mode="play" className="flex flex-col">
      <MinimalHeader />
      <main className="flex-1">{children}</main>
    </Surface>
  );
}
