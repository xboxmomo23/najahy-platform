declare module "react-katex" {
  import type { ComponentType, HTMLAttributes } from "react";

  export type MathComponentProps = {
    math: string;
    errorColor?: string;
    renderError?: (error: Error | unknown) => React.ReactNode;
  } & HTMLAttributes<HTMLElement>;

  export const BlockMath: ComponentType<MathComponentProps>;
  export const InlineMath: ComponentType<MathComponentProps>;
}
