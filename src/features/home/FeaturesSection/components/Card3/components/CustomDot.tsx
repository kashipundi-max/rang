// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CustomDot(props: any) {
  const { cx, cy } = props;
  return (
    <g>
      {/* Pulsing outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={12}
        fill="var(--color-brand-primary-light)"
        fillOpacity="0.15"
      >
        <animate
          attributeName="r"
          values="8;14;8"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="fill-opacity"
          values="0.3;0.1;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="var(--color-brand-primary-light)"
        fillOpacity="0.3"
      />
      <circle cx={cx} cy={cy} r={4} fill="#fff" />
    </g>
  );
}
