/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {BaseMetaModelElement, DefaultEntityValue, EntityValueProperty} from '@ame/meta-model';
import {BaseModelService} from './base-model-service';
import {EntityValueRenderService, MxGraphHelper} from '@ame/mx-graph';
import {isDataTypeLangString} from '@ame/shared';

@Injectable({providedIn: 'root'})
export class EntityValueModelService extends BaseModelService {
  constructor(private entityValueRenderService: EntityValueRenderService) {
    super();
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultEntityValue;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}): void {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntityValue>(cell);
    // update name
    const aspectModelUrn = this.modelService.currentRdfModel.getAspectModelUrn();
    this.currentCachedFile.updateCachedElementKey(`${aspectModelUrn}${modelElement.name}`, `${aspectModelUrn}${form.name}`);
    modelElement.name = form.name;
    modelElement.aspectModelUrn = `${aspectModelUrn}${form.name}`;

    // in case some entity values are no longer assigned as property values to the current entity, remove them from the model
    this.removeObsoleteEntityValues(modelElement);

    const newEntityValues = form.newEntityValues;
    // check if there are any new entity values to add to the cache service
    if (newEntityValues) {
      this.addNewEntityValues(newEntityValues, modelElement);
    }

    this.updatePropertiesEntityValues(modelElement, form);
    this.entityValueRenderService.update({cell, form});
  }

  delete(cell: mxgraph.mxCell): void {
    super.delete(cell);
    this.entityValueRenderService.delete(cell);
  }

  private updatePropertiesEntityValues(metaModelElement: DefaultEntityValue, form: {[key: string]: any}): void {
    const {entityValueProperties} = form;

    metaModelElement.properties.forEach(element => {
      const propertyKey = element.key.property.name;

      element.value = isDataTypeLangString(element.key.property)
        ? {value: entityValueProperties[propertyKey], language: entityValueProperties[`${propertyKey}-lang`]}
        : entityValueProperties[propertyKey];
    });
  }

  private removeObsoleteEntityValues(metaModelElement: DefaultEntityValue): void {
    metaModelElement.properties.forEach((property: EntityValueProperty) => {
      if (property.value instanceof DefaultEntityValue && !property.value.parents?.length) {
        this.deleteEntityValue(property.value, metaModelElement);
      }
    });
  }
}
