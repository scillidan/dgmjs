/*
 * Copyright (c) 2022 MKLabs. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of MKLabs. The intellectual and technical concepts
 * contained herein are proprietary to MKLabs and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from MKLabs (niklaus.lee@gmail.com).
 */

import React from "react";
import { Panel } from "../common/panel";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ShapeEditorProps } from "@/types";
import { merge } from "@/utils";
import { Freehand } from "@dgmjs/core";

export const FreehandPanel: React.FC<ShapeEditorProps> = ({
  shapes,
  onChange,
}) => {
  const thinning = merge(shapes.map((s) => (s as Freehand).thinning));
  const tailTaper = merge(shapes.map((s) => (s as Freehand).tailTaper));
  const headTaper = merge(shapes.map((s) => (s as Freehand).headTaper));

  return (
    <Panel title="Freehand" borderTop>
      <div className="flex h-9 items-center gap-3">
        <Label className="font-normal">Thining</Label>
        <div className="w-full">
          <Slider
            max={1}
            step={0.1}
            min={0}
            value={[thinning || 0]}
            onValueChange={(value) =>
              onChange({ thinning: value.length > 0 ? value[0] : 0 })
            }
          />
        </div>
      </div>
      <div className="flex h-9 items-center gap-3">
        <Label className="font-normal">Tail Taper</Label>
        <div className="w-full">
          <Slider
            max={1}
            step={0.01}
            min={0}
            value={[tailTaper || 0]}
            onValueChange={(value) =>
              onChange({ tailTaper: value.length > 0 ? value[0] : 0 })
            }
          />
        </div>
      </div>
      <div className="flex h-9 items-center gap-3">
        <Label className="font-normal">Head Taper</Label>
        <div className="w-full">
          <Slider
            max={1}
            step={0.01}
            min={0}
            value={[headTaper || 0]}
            onValueChange={(value) =>
              onChange({ headTaper: value.length > 0 ? value[0] : 0 })
            }
          />
        </div>
      </div>
    </Panel>
  );
};
