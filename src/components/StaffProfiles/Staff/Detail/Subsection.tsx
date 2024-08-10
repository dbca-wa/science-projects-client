import { ReactNode } from "react";

const Subsection = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="py-4">
        <p className="font-semibold text-lg">{title}</p>
        {children}
    </div>
)
export default Subsection