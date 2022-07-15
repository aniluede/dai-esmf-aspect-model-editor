/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {Base, BaseMetaModelElement} from './base';
import {AspectModelVisitor} from '@ame/mx-graph';
import {OverWrittenProperty} from './overwritten-property';

export interface Operation extends BaseMetaModelElement {
  input: Array<OverWrittenProperty>;
  output?: OverWrittenProperty;
}

export class DefaultOperation extends Base implements Operation {
  static createInstance() {
    return new DefaultOperation(null, null, 'operation', [], null);
  }

  get className() {
    return 'DefaultOperation';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public input: Array<OverWrittenProperty> = [],
    public output?: OverWrittenProperty
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitOperation(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (this.output && this.output.property.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.output = null;
    }

    this.input = this.input.filter(inputProperty => inputProperty.property.aspectModelUrn !== baseMetalModelElement.aspectModelUrn);
  }
}
