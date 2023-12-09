export const loadFile = async (path: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText);
      } else {
        reject(new Error("Failed to load file."));
      }
    };
    request.onerror = () => {
      reject(new Error("Failed to load file."));
    };
    request.send();
  });
};

const createShader = (
  gl: WebGLRenderingContext,
  type: "VERTEX_SHADER" | "FRAGMENT_SHADER",
  source: string
) => {
  if (!gl) {
    throw new Error("No WebGL context.");
  }
  const shader = gl.createShader(gl[type]);

  if (!shader) {
    throw new Error("Unable to create a shader.");
  }

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
  }

  return shader;
};

export const createProgram = async (
  gl: WebGLRenderingContext,
  vs: string,
  fs: string
): Promise<WebGLProgram> => {
  // Vertex shader
  const vertexShader = createShader(gl, "VERTEX_SHADER", vs);

  // Fragment shader
  const fragmentShader = createShader(gl, "FRAGMENT_SHADER", fs);

  // WebGL program
  const program = gl.createProgram();

  if (!program) {
    throw new Error("Unable to create the program.");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      `Unable to link the shaders: ${gl.getProgramInfoLog(program)}`
    );
  }

  return program;
};

export const createVbo = (gl: WebGLRenderingContext, data: number[]) => {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
};

export const createIbo = (gl: WebGLRenderingContext, data: number[]) => {
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return ibo;
};

export const createCubeTextureFromFile = (
  gl: WebGLRenderingContext,
  source: string[],
  target: number[]
): Promise<WebGLTexture | null> => {
  return new Promise((resolve) => {
    const promises = source.map((src) => {
      return new Promise<HTMLImageElement>((loadedResolve) => {
        const img = new Image();
        img.onload = () => {
          loadedResolve(img);
        };
        img.src = src;
      });
    });
    Promise.all(promises).then((images) => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      target.forEach((target, index) => {
        gl.texImage2D(
          target,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          images[index]
        );
      });
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
      resolve(texture);
    });
  });
};


