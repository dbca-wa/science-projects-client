import { Plus, Minus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface MapSidebarSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

const MapSidebarSection = ({
  title,
  children,
  className,
  defaultOpen = true,
}: MapSidebarSectionProps) => {
  return (
    <div className={cn("p-4", className)}>
      <Accordion
        type="single"
        defaultValue={defaultOpen ? "item-1" : undefined}
      >
        <AccordionItem value="item-1" className="border-none">
          <div className="flex items-center justify-between">
            {/* bg-blue-300 */}
            <h3 className="text-sm font-semibold text-muted-foreground">
              {title}
            </h3>
            <AccordionTrigger className="flex items-center justify-between py-0">
              {/* Custom indicator instead of the default chevron */}
              <div className="ml-2 shrink-0">
                {/* AccordionTrigger applies data-[state=open] automatically */}
                <Plus className="h-4 w-4 shrink-0 data-[state=open]:hidden" />
                <Minus className="hidden h-4 w-4 shrink-0 data-[state=open]:block" />
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent>
            <div className="mt-2">{children}</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Separator className="mt-4 bg-blue-200" />
    </div>
  );
};

export default MapSidebarSection;
