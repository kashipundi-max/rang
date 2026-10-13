"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"

export const TextHoverEffect = ({
    text,
    duration = 0.3,
    automatic = false,
    className,
}: {
    text: string
    duration?: number
    automatic?: boolean
    className?: string
}) => {
    const svgRef = useRef<SVGSVGElement>(null)
    const [hovered, setHovered] = useState(false)
    const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" })
    const [autoAnimProgress, setAutoAnimProgress] = useState(0)

    // Use useCallback to memoize the mouse move handler
    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (automatic) return;

        if (svgRef.current) {
            const svgRect = svgRef.current.getBoundingClientRect()
            const cxPercentage = ((e.clientX - svgRect.left) / svgRect.width) * 100
            const cyPercentage = ((e.clientY - svgRect.top) / svgRect.height) * 100

            setMaskPosition({
                cx: `${cxPercentage}%`,
                cy: `${cyPercentage}%`,
            })
        }
    }, [automatic]);

    // Auto-animation effect
    useEffect(() => {
        if (!automatic) return

        let animationFrameId: number
        let startTime: number

        // Set hovered to true for automatic mode
        setHovered(true)

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime

            // Complete one cycle every 5 seconds
            const progress = (elapsed % 5000) / 5000
            setAutoAnimProgress(progress)

            animationFrameId = requestAnimationFrame(animate)
        }

        animationFrameId = requestAnimationFrame(animate)

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
            if (automatic) {
                setHovered(false)
            }
        }
    }, [automatic])

    // Position calculation effect
    useEffect(() => {
        if (automatic) {
            // Calculate position for automatic circular movement
            const angle = autoAnimProgress * Math.PI * 2
            const centerX = 50
            const centerY = 50
            const radius = 30 // Percentage of movement radius

            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)

            setMaskPosition({
                cx: `${x}%`,
                cy: `${y}%`,
            })
        }
        // Remove this effect for manual cursor control - it's now handled directly in the mouse move handler
    }, [automatic, autoAnimProgress]);

    return (
        <div className={`${className}`}>
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 300 100"
                xmlns="http://www.w3.org/2000/svg"
                onMouseEnter={() => !automatic && setHovered(true)}
                onMouseLeave={() => !automatic && setHovered(false)}
                onMouseMove={handleMouseMove}
                className="select-none"
            >
                <defs>
                    <linearGradient id="textGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
                        {(hovered || automatic) && (
                            <>
                                <stop offset="0%" stopColor="#eab308" />
                                <stop offset="25%" stopColor="#ef4444" />
                                <stop offset="50%" stopColor="#3b82f6" />
                                <stop offset="75%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </>
                        )}
                    </linearGradient>

                    <motion.radialGradient
                        id="revealMask"
                        gradientUnits="userSpaceOnUse"
                        r="20%"
                        initial={{ cx: "50%", cy: "50%" }}
                        animate={maskPosition}
                        transition={{ duration: duration ?? 0, ease: "easeOut" }}
                    >
                        <stop offset="0%" stopColor="white" />
                        <stop offset="100%" stopColor="black" />
                    </motion.radialGradient>
                    <mask id="textMask">
                        <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
                    </mask>
                </defs>
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    strokeWidth="0.3"
                    className="fill-transparent stroke-neutral-200 font-[helvetica] text-7xl font-bold dark:stroke-neutral-800"
                    style={{ opacity: hovered || automatic ? 0.7 : 0 }}
                >
                    {text}
                </text>
                <motion.text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    strokeWidth="0.3"
                    className="fill-transparent stroke-neutral-200 font-[helvetica] text-7xl font-bold dark:stroke-neutral-800"
                    initial={{ strokeDashoffset: 1500, strokeDasharray: 1500 }}
                    animate={{
                        strokeDashoffset: 0,
                        strokeDasharray: 1500,
                    }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                    }}
                >
                    {text}
                </motion.text>
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    stroke="url(#textGradient)"
                    strokeWidth="0.3"
                    mask="url(#textMask)"
                    className="fill-transparent font-[helvetica] text-7xl font-bold"
                >
                    {text}
                </text>
            </svg>
        </div>
    )
}

