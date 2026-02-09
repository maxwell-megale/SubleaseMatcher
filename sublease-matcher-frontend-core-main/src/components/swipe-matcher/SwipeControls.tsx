import Image from "next/image";

type SwipeControlsProps = {
  onPass: () => void;
  onUndo: () => void;
  onLike: () => void;
  disabled?: boolean;
  layout?: 'floating' | 'inline';
  className?: string;
};

export default function SwipeControls({
  onPass,
  onUndo,
  onLike,
  disabled = false,
  layout = 'floating',
  className,
}: SwipeControlsProps) {
  const Button = ({
    onClick,
    label,
    icon,
  }: {
    onClick: () => void;
    label: string;
    icon: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-14 w-14 place-items-center rounded-full bg-white text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition hover:scale-[1.03] hover:shadow-[0_12px_28px_rgba(15,23,42,0.18)] disabled:pointer-events-none disabled:opacity-60"
    >
      <Image src={icon} alt="" width={32} height={32} aria-hidden="true" />
    </button>
  );

  const navClassName = [
    layout === 'inline' ? 'w-full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <nav className={navClassName}>
      <div
        className={
          layout === 'inline'
            ? 'flex items-center justify-center gap-6'
            : 'pointer-events-auto absolute inset-x-0 -bottom-6 z-20 flex items-center justify-center gap-6'
        }
      >
        <Button onClick={onPass} label="Pass seeker" icon="/x.svg" />
        <Button onClick={onUndo} label="Undo last decision" icon="/undo.svg" />
        <Button onClick={onLike} label="Like seeker" icon="/check.svg" />
      </div>
    </nav>
  );
}
