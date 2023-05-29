import './app.element.css';

import { AnimationLoop } from '@earth.gl/engine';

const loop = new AnimationLoop({
  onInitialize: ({ canvas, context, device, gpu }) => {
    document.body.appendChild(canvas);

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    const presentationFormat = gpu.getPreferredCanvasFormat();

    context.configure({
      device,
      format: presentationFormat,
      alphaMode: 'premultiplied',
    });

    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({
          code: /* wgsl */ `
          @vertex
          fn main(
            @builtin(vertex_index) VertexIndex : u32
          ) -> @builtin(position) vec4<f32> {
            var pos = array<vec2<f32>, 3>(
              vec2( 0.0,  0.5),
              vec2(-0.5, -0.5),
              vec2( 0.5, -0.5)
            );

            return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
          }`,
        }),
        entryPoint: 'main',
      },
      fragment: {
        module: device.createShaderModule({
          code: /* wgsl */ `
          @fragment
          fn main() -> @location(0) vec4<f32> {
            return vec4(1.0, 0.0, 0.0, 1.0);
          }`,
        }),
        entryPoint: 'main',
        targets: [
          {
            format: presentationFormat,
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
      multisample: {
        count: 4,
      },
    });

    const view = device
      .createTexture({
        size: [canvas.width, canvas.height],
        sampleCount: 4,
        format: presentationFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      })
      .createView();

    return { pipeline, view };
  },
  onRender: ({ device, context, props }) => {
    const commandEncoder = device.createCommandEncoder();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view:props.view,
          resolveTarget: context.getCurrentTexture().createView(),
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'discard',
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(props.pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
  },
});

loop.start();
