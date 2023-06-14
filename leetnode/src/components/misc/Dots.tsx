import { createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  dots: {
    zIndex: -1,
    position: "absolute",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],

    "@media (max-width: 568px)": {
      display: "none",
    },
  },
}));

export interface DotsProps extends React.ComponentPropsWithoutRef<'svg'> {
  size?: number;
  radius?: number;
}

export function DotsSvg({ size = 185, radius = 2.5, ...others }: DotsProps) {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 185 185"
      width={size}
      height={size}
      {...others}
    >
      <rect width="5" height="5" rx={radius} />
      <rect width="5" height="5" x="60" rx={radius} />
      <rect width="5" height="5" x="120" rx={radius} />
      <rect width="5" height="5" x="20" rx={radius} />
      <rect width="5" height="5" x="80" rx={radius} />
      <rect width="5" height="5" x="140" rx={radius} />
      <rect width="5" height="5" x="40" rx={radius} />
      <rect width="5" height="5" x="100" rx={radius} />
      <rect width="5" height="5" x="160" rx={radius} />
      <rect width="5" height="5" x="180" rx={radius} />
      <rect width="5" height="5" y="20" rx={radius} />
      <rect width="5" height="5" x="60" y="20" rx={radius} />
      <rect width="5" height="5" x="120" y="20" rx={radius} />
      <rect width="5" height="5" x="20" y="20" rx={radius} />
      <rect width="5" height="5" x="80" y="20" rx={radius} />
      <rect width="5" height="5" x="140" y="20" rx={radius} />
      <rect width="5" height="5" x="40" y="20" rx={radius} />
      <rect width="5" height="5" x="100" y="20" rx={radius} />
      <rect width="5" height="5" x="160" y="20" rx={radius} />
      <rect width="5" height="5" x="180" y="20" rx={radius} />
      <rect width="5" height="5" y="40" rx={radius} />
      <rect width="5" height="5" x="60" y="40" rx={radius} />
      <rect width="5" height="5" x="120" y="40" rx={radius} />
      <rect width="5" height="5" x="20" y="40" rx={radius} />
      <rect width="5" height="5" x="80" y="40" rx={radius} />
      <rect width="5" height="5" x="140" y="40" rx={radius} />
      <rect width="5" height="5" x="40" y="40" rx={radius} />
      <rect width="5" height="5" x="100" y="40" rx={radius} />
      <rect width="5" height="5" x="160" y="40" rx={radius} />
      <rect width="5" height="5" x="180" y="40" rx={radius} />
      <rect width="5" height="5" y="60" rx={radius} />
      <rect width="5" height="5" x="60" y="60" rx={radius} />
      <rect width="5" height="5" x="120" y="60" rx={radius} />
      <rect width="5" height="5" x="20" y="60" rx={radius} />
      <rect width="5" height="5" x="80" y="60" rx={radius} />
      <rect width="5" height="5" x="140" y="60" rx={radius} />
      <rect width="5" height="5" x="40" y="60" rx={radius} />
      <rect width="5" height="5" x="100" y="60" rx={radius} />
      <rect width="5" height="5" x="160" y="60" rx={radius} />
      <rect width="5" height="5" x="180" y="60" rx={radius} />
      <rect width="5" height="5" y="80" rx={radius} />
      <rect width="5" height="5" x="60" y="80" rx={radius} />
      <rect width="5" height="5" x="120" y="80" rx={radius} />
      <rect width="5" height="5" x="20" y="80" rx={radius} />
      <rect width="5" height="5" x="80" y="80" rx={radius} />
      <rect width="5" height="5" x="140" y="80" rx={radius} />
      <rect width="5" height="5" x="40" y="80" rx={radius} />
      <rect width="5" height="5" x="100" y="80" rx={radius} />
      <rect width="5" height="5" x="160" y="80" rx={radius} />
      <rect width="5" height="5" x="180" y="80" rx={radius} />
      <rect width="5" height="5" y="100" rx={radius} />
      <rect width="5" height="5" x="60" y="100" rx={radius} />
      <rect width="5" height="5" x="120" y="100" rx={radius} />
      <rect width="5" height="5" x="20" y="100" rx={radius} />
      <rect width="5" height="5" x="80" y="100" rx={radius} />
      <rect width="5" height="5" x="140" y="100" rx={radius} />
      <rect width="5" height="5" x="40" y="100" rx={radius} />
      <rect width="5" height="5" x="100" y="100" rx={radius} />
      <rect width="5" height="5" x="160" y="100" rx={radius} />
      <rect width="5" height="5" x="180" y="100" rx={radius} />
      <rect width="5" height="5" y="120" rx={radius} />
      <rect width="5" height="5" x="60" y="120" rx={radius} />
      <rect width="5" height="5" x="120" y="120" rx={radius} />
      <rect width="5" height="5" x="20" y="120" rx={radius} />
      <rect width="5" height="5" x="80" y="120" rx={radius} />
      <rect width="5" height="5" x="140" y="120" rx={radius} />
      <rect width="5" height="5" x="40" y="120" rx={radius} />
      <rect width="5" height="5" x="100" y="120" rx={radius} />
      <rect width="5" height="5" x="160" y="120" rx={radius} />
      <rect width="5" height="5" x="180" y="120" rx={radius} />
      <rect width="5" height="5" y="140" rx={radius} />
      <rect width="5" height="5" x="60" y="140" rx={radius} />
      <rect width="5" height="5" x="120" y="140" rx={radius} />
      <rect width="5" height="5" x="20" y="140" rx={radius} />
      <rect width="5" height="5" x="80" y="140" rx={radius} />
      <rect width="5" height="5" x="140" y="140" rx={radius} />
      <rect width="5" height="5" x="40" y="140" rx={radius} />
      <rect width="5" height="5" x="100" y="140" rx={radius} />
      <rect width="5" height="5" x="160" y="140" rx={radius} />
      <rect width="5" height="5" x="180" y="140" rx={radius} />
      <rect width="5" height="5" y="160" rx={radius} />
      <rect width="5" height="5" x="60" y="160" rx={radius} />
      <rect width="5" height="5" x="120" y="160" rx={radius} />
      <rect width="5" height="5" x="20" y="160" rx={radius} />
      <rect width="5" height="5" x="80" y="160" rx={radius} />
      <rect width="5" height="5" x="140" y="160" rx={radius} />
      <rect width="5" height="5" x="40" y="160" rx={radius} />
      <rect width="5" height="5" x="100" y="160" rx={radius} />
      <rect width="5" height="5" x="160" y="160" rx={radius} />
      <rect width="5" height="5" x="180" y="160" rx={radius} />
      <rect width="5" height="5" y="180" rx={radius} />
      <rect width="5" height="5" x="60" y="180" rx={radius} />
      <rect width="5" height="5" x="120" y="180" rx={radius} />
      <rect width="5" height="5" x="20" y="180" rx={radius} />
      <rect width="5" height="5" x="80" y="180" rx={radius} />
      <rect width="5" height="5" x="140" y="180" rx={radius} />
      <rect width="5" height="5" x="40" y="180" rx={radius} />
      <rect width="5" height="5" x="100" y="180" rx={radius} />
      <rect width="5" height="5" x="160" y="180" rx={radius} />
      <rect width="5" height="5" x="180" y="180" rx={radius} />
    </svg>
  );
}

export type DotPositionType = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export default function Dots({ dotPositions }: { dotPositions: DotPositionType[] }) {
  const { classes } = useStyles();
  return (
    <>
      {
        dotPositions.map((dotPosition, index) => (
            <DotsSvg
              key={index}
              style={dotPosition}
              className={classes.dots} 
            />
        )
      )}
    </>
  );
}
