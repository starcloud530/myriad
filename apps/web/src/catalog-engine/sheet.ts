import type { Messages } from "../i18n/messages.ts";
import { compactCount, contextLabel } from "./health.ts";
import { modalityLabel } from "./price.ts";
import type { AbilityId, ModelModality, ModelRecord, ToolId } from "./spec.ts";
import { ABILITY_IDS, TOOL_IDS } from "./spec.ts";

export type AbilityChip = {
  key: string;
  label: string;
  on: boolean;
};

export type LimitCell = {
  key: string;
  label: string;
  value: string;
};

function joinModalities(items: ModelModality[], copy: Messages): string {
  const names = modalityLabel(copy);
  return items.map((item) => names[item]).join(" · ");
}

export function ioTypes(model: ModelRecord, copy: Messages): { input: string; output: string } {
  return {
    input: joinModalities(model.io.input, copy),
    output: joinModalities(model.io.output, copy),
  };
}

export function heroChips(model: ModelRecord, copy: Messages): string[] {
  const names = modalityLabel(copy);
  const chips = [...new Set([...model.io.input, ...model.io.output])].map((item) => names[item]);
  if (model.abilities.thinking) {
    chips.push(copy.detail.ability.thinking);
  }
  return chips;
}

export function abilityChips(model: ModelRecord, copy: Messages): AbilityChip[] {
  return ABILITY_IDS.filter((id) => id in model.abilities).map((id) => ({
    key: id,
    label: copy.detail.ability[id],
    on: Boolean(model.abilities[id as AbilityId]),
  }));
}

export function toolChips(model: ModelRecord, copy: Messages): AbilityChip[] {
  return TOOL_IDS.filter((id) => id in model.tools).map((id) => ({
    key: id,
    label: copy.detail.tool[id],
    on: Boolean(model.tools[id as ToolId]),
  }));
}

export function limitCells(model: ModelRecord, copy: Messages): LimitCell[] {
  const specs = model.specs;
  if (!specs) {
    return [];
  }
  const cells: LimitCell[] = [];
  const context = contextLabel(model, copy);
  if (context) {
    cells.push({ key: "context", label: copy.detail.context, value: context });
  }
  if (specs.max_input != null) {
    cells.push({ key: "max_input", label: copy.detail.maxInput, value: compactCount(specs.max_input) });
  }
  if (specs.max_output != null) {
    cells.push({ key: "max_output", label: copy.detail.maxOutput, value: compactCount(specs.max_output) });
  }
  if (specs.tpm != null) {
    cells.push({ key: "tpm", label: copy.detail.tpm, value: compactCount(specs.tpm) });
  }
  if (specs.rpm != null) {
    cells.push({ key: "rpm", label: copy.detail.rpm, value: compactCount(specs.rpm) });
  }
  return cells;
}
