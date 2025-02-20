interface MapSidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const MapSidebarSection = ({ title, children }: MapSidebarSectionProps) => {
  return (
    <div className="p-4">
      <div className="mt-2">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
};

export default MapSidebarSection;
