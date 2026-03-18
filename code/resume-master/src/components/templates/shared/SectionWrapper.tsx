import { motion } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
    sectionId: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Thin interaction wrapper for all section components.
 * Provides hover highlight + click-to-select behavior.
 */
const SectionWrapper: React.FC<SectionWrapperProps> = ({
    sectionId,
    children,
    className = "",
    style,
}) => {
    const { setActiveSection, activeResume } = useResumeStore();
    const configuredHeight = activeResume?.globalSettings?.sectionHeights?.[sectionId];
    const targetHeight = useMemo(() => {
        if (!configuredHeight || configuredHeight <= 0) {
            return undefined;
        }
        return configuredHeight;
    }, [configuredHeight]);

    const innerRef = useRef<HTMLDivElement>(null);
    const [naturalHeight, setNaturalHeight] = useState(0);

    useEffect(() => {
        if (!targetHeight || !innerRef.current) {
            return;
        }

        const element = innerRef.current;
        const updateHeight = () => {
            const next = element.scrollHeight;
            if (next > 0) {
                setNaturalHeight((prev) => (Math.abs(prev - next) > 1 ? next : prev));
            }
        };

        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(element);

        return () => observer.disconnect();
    }, [targetHeight, children]);

    const scaleFactor = useMemo(() => {
        if (!targetHeight || naturalHeight <= 0) {
            return 1;
        }

        const raw = targetHeight / naturalHeight;
        return Math.min(1.35, Math.max(0.6, raw));
    }, [targetHeight, naturalHeight]);

    const wrapperStyle: React.CSSProperties = {
        ...style,
        ...(targetHeight
            ? {
                height: `${targetHeight}px`,
                minHeight: `${targetHeight}px`,
                overflow: "hidden",
            }
            : {}),
    };

    const contentStyle: React.CSSProperties | undefined =
        targetHeight && naturalHeight > 0
            ? {
                transform: `scale(${scaleFactor})`,
                transformOrigin: "top left",
                width: `${100 / scaleFactor}%`,
            }
            : undefined;

    return (
        <motion.div
            data-resume-section-id={sectionId}
            className={cn(
                "hover:cursor-pointer rounded-md transition-all duration-300 ease-in-out hover:shadow-md",
                "hover:bg-[#f9f8f3]",
                className
            )}
            style={wrapperStyle}
            onClick={() => setActiveSection(sectionId)}
        >
            <div ref={innerRef} style={contentStyle}>
                {children}
            </div>
        </motion.div>
    );
};

export default SectionWrapper;
