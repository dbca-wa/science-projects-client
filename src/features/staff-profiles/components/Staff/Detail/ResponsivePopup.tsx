import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";

interface ResponsivePopupProps {
  children: ReactNode;
  triggerComponent: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const ResponsivePopup: FC<ResponsivePopupProps> = ({
  children,
  triggerComponent,
  title,
  description,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleClose = () => setIsOpen(false);

  const sharedContent = (
    <>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {children}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
        <DialogContent className={className}>
          <DialogHeader>
            <DialogTitle className="mt-3 mb-2">{title}</DialogTitle>
            {description && (
              <DialogDescription className="hidden">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          {sharedContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{triggerComponent}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b border-gray-200">
          <DrawerTitle>{title}</DrawerTitle>
          {description && (
            <DrawerDescription className="hidden">
              {description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="px-4 py-6">{sharedContent}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsivePopup;
