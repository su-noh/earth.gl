/// <reference types="@webgpu/types" />

export type GPUContext = {
  gpu: GPU;
  canvas: HTMLCanvasElement;
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
};

export const requestGPUContext = async (
  canvas: HTMLCanvasElement
): Promise<GPUContext> => {
  const gpu = navigator.gpu;
  const context = canvas.getContext('webgpu');

  if (!gpu || !context) {
    throw new Error('this browser is not support webgpu');
  }

  const adapter = await gpu.requestAdapter();

  if (!adapter) {
    throw new Error('request adapter failed');
  }

  const device = await adapter.requestDevice();

  return { gpu, adapter, device, canvas, context };
};
