#pragma once

#include <functional>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

#include <jsi/jsi.h>

#include "JsiValueWrapper.h"
#include "RNSkView.h"

#include "JsiSkPicture.h"
#include "JsiSkSurface.h"
#include "RNSkInfoParameter.h"
#include "RNSkLog.h"
#include "RNSkPlatformContext.h"
#include "RNSkTimingInfo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkBBHFactory.h"
#include "SkCanvas.h"
#include "SkPictureRecorder.h"

#pragma clang diagnostic pop

class SkPicture;
class SkRect;
class SkImage;

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkPictureRenderer
    : public RNSkRenderer,
      public std::enable_shared_from_this<RNSkPictureRenderer> {
public:
  RNSkPictureRenderer(std::function<void()> requestRedraw,
                      std::shared_ptr<RNSkPlatformContext> context)
      : RNSkRenderer(requestRedraw), _platformContext(context) {}

  bool tryRender(std::shared_ptr<RNSkCanvasProvider> canvasProvider) override {
    return performDraw(canvasProvider);
  }

  void
  renderImmediate(std::shared_ptr<RNSkCanvasProvider> canvasProvider) override {
    performDraw(canvasProvider);
  }

  void setPicture(std::shared_ptr<jsi::HostObject> picture) {
    if (picture == nullptr) {
      _picture = nullptr;
      return;
    }

    _picture = std::dynamic_pointer_cast<JsiSkPicture>(picture);
    _requestRedraw();
  }


  void setTexture(std::shared_ptr<jsi::HostObject> texture) {
    if (texture == nullptr) {
      _texture = nullptr;
      return;
    }

    _texture = std::dynamic_pointer_cast<JsiSkSurface>(texture);
    _requestRedraw();
  }

private:
  bool performDraw(std::shared_ptr<RNSkCanvasProvider> canvasProvider) {
    canvasProvider->renderToCanvas([=](SkCanvas *canvas) {
      // Make sure to scale correctly
      auto pd = _platformContext->getPixelDensity();
      canvas->clear(SK_ColorTRANSPARENT);
      canvas->save();
      canvas->scale(pd, pd);

      if (_texture != nullptr) {
        canvas->drawImage(_texture->getObject()->makeImageSnapshot()->makeNonTextureImage(), 0, 0);
      } else if (_picture != nullptr) {
        canvas->drawPicture(_picture->getObject());
      }

      canvas->restore();
    });
    return true;
  }

  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::shared_ptr<JsiSkPicture> _picture;
  std::shared_ptr<JsiSkSurface> _texture;
};

class RNSkPictureView : public RNSkView {
public:
  /**
   * Constructor
   */
  RNSkPictureView(std::shared_ptr<RNSkPlatformContext> context,
                  std::shared_ptr<RNSkCanvasProvider> canvasProvider)
      : RNSkView(
            context, canvasProvider,
            std::make_shared<RNSkPictureRenderer>(
                std::bind(&RNSkPictureView::requestRedraw, this), context)) {}

  void setJsiProperties(
      std::unordered_map<std::string, RNJsi::JsiValueWrapper> &props) override {

    RNSkView::setJsiProperties(props);

    for (auto &prop : props) {
      if (prop.first == "texture") {
          // Clear picture
          std::static_pointer_cast<RNSkPictureRenderer>(getRenderer())
              ->setTexture(prop.second.getAsHostObject());
          requestRedraw();
      } else if (prop.first == "picture") {
        if (prop.second.isUndefinedOrNull()) {
          // Clear picture
          std::static_pointer_cast<RNSkPictureRenderer>(getRenderer())
              ->setPicture(nullptr);
          requestRedraw();
          continue;
        } else if (prop.second.getType() !=
                   RNJsi::JsiWrapperValueType::HostObject) {
          // We expect a function for the picture custom property
          throw std::runtime_error(
              "Expected an object for the picture custom property.");
        }

        // Save picture
        std::static_pointer_cast<RNSkPictureRenderer>(getRenderer())
            ->setPicture(prop.second.getAsHostObject());

        // Request redraw
        requestRedraw();
      }
    }
  }
};
} // namespace RNSkia
