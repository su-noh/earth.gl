import { requestGPUContext, type GPUContext } from './request-gpu-context';

export type OnRenderProps = GPUContext & { time: DOMHighResTimeStamp };

export interface AnimationLoopProps<T = any> {
  canvas?: HTMLCanvasElement;
  onInitialize(context: GPUContext): T;
  onRender(context: OnRenderProps & { props: T }): void;
}

export class AnimationLoop<T> {
  #handle: number | null = null;

  readonly props: Readonly<Required<AnimationLoopProps<T>>>;

  constructor(props: AnimationLoopProps<T>) {
    this.props = {
      canvas: props.canvas || document.createElement('canvas'),
      onInitialize: props.onInitialize,
      onRender: props.onRender,
    };
  }

  private context: GPUContext | null = null;

  async start() {
    if (this.#handle !== null) {
      return;
    }

    this.context = await requestGPUContext(this.props.canvas);

    const props = this.props.onInitialize(this.context);

    /**
     * animation callback
     * @param time
     */
    const frame = (time: DOMHighResTimeStamp) => {
      if (this.context === null) {
        return;
      }

      this.props.onRender({ time, ...this.context, props });
      this.#handle = requestAnimationFrame(frame);
    };

    this.#handle = requestAnimationFrame(frame);
  }

  stop(): void {
    if (this.#handle !== null) {
      cancelAnimationFrame(this.#handle);
      this.#handle = null;
    }

    this.context = null;
  }
}
