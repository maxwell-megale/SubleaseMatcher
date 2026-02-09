import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/default/slider";

export default function SliderDemo() {
  return (
    <div className="m-3">
      <Slider
        defaultValue={[50]}
        max={100}
        step={1}
        className={cn("w-[100%]")}
      />
    </div>
  );
}
