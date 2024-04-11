//
//  SkiaCVPixelBufferUtils.h
//  react-native-skia
//
//  Created by Marc Rousavy on 10.04.24.
//

#pragma once
#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>
#import <MetalKit/MetalKit.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"
#import "include/core/SkColorSpace.h"
#import "include/gpu/GrBackendSurface.h"
#import "include/gpu/GrYUVABackendTextures.h"
#pragma clang diagnostic pop

class SkiaCVPixelBufferUtils {
public:
  enum class CVPixelBufferBaseFormat { rgb, yuv };

  /**
   Get the base format (currently only RGB) of the PixelBuffer.
   Depending on the base-format, different methods have to be used to create
   Skia buffers.
   */
  static CVPixelBufferBaseFormat
  getCVPixelBufferBaseFormat(CVPixelBufferRef pixelBuffer);

  class RGB {
  public:
    /**
     Gets the Skia Color Type of the RGB pixel-buffer.
     */
    static SkColorType getCVPixelBufferColorType(CVPixelBufferRef pixelBuffer);
    /**
     Gets a GPU-backed Skia Texture for the given RGB CVPixelBuffer.
     */
    static GrBackendTexture
    getSkiaTextureForCVPixelBuffer(CVPixelBufferRef pixelBuffer);
  };
  
  class YUV {
  public:
    /**
     Gets one or more GPU-backed Skia Textures for the given YUV CVPixelBuffer.
     The size of the resulting textures depends on the amount of planes in the CVPixelBuffer.
     */
    static GrYUVABackendTextures getSkiaTextureForCVPixelBuffer(CVPixelBufferRef pixelBuffer);
    
  private:
    static SkYUVAInfo::PlaneConfig getPlaneConfig(OSType pixelFormat);
    static SkYUVAInfo::Subsampling getSubsampling(OSType pixelFormat);
    static SkYUVColorSpace getColorspace(OSType pixelFormat);
    static SkYUVAInfo getYUVAInfoForCVPixelBuffer(CVPixelBufferRef pixelBuffer);
  };

private:
  static CVMetalTextureCacheRef getTextureCache();
  static GrBackendTexture
  getSkiaTextureForCVPixelBufferPlane(CVPixelBufferRef pixelBuffer,
                                      size_t planeIndex);
  static MTLPixelFormat
  getMTLPixelFormatForCVPixelBufferPlane(CVPixelBufferRef pixelBuffer,
                                         size_t planeIndex);
};
