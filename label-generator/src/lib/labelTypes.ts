import { LabelTypeConfig } from '@/types';

export const LABEL_TYPES: LabelTypeConfig[] = [
  {
    id: 'PatchCord',
    name: 'PatchCord EFO',
    prefix: 'PC',
    template: 'AdhesivosPatchCords80x60.pdf',
    description: 'Cables PatchCord estándar EFO'
  },
  {
    id: 'PatchCord RIMPORT',
    name: 'PatchCord RIMPORT',
    prefix: 'PCR',
    template: 'AdhesivosPatchCords RIMPORT80x60.pdf',
    description: 'Cables PatchCord marca RIMPORT'
  },
  {
    id: 'PatchCord COENTEL',
    name: 'PatchCord COENTEL',
    prefix: 'PCC',
    template: 'AdhesivosPatchCordsCOENTEL80x60.pdf',
    description: 'Cables PatchCord marca COENTEL'
  },
  {
    id: 'PatchCord Duplex',
    name: 'PatchCord Duplex EFO',
    prefix: 'PCD',
    template: 'AdhesivosPatchCordsDuplex80x60.pdf',
    description: 'Cables PatchCord Duplex estándar EFO'
  },
  {
    id: 'PatchCord Duplex RIMPORT',
    name: 'PatchCord Duplex RIMPORT',
    prefix: 'PCDR',
    template: 'AdhesivosPatchCordsDuplex RIMPORT80X60.pdf',
    description: 'Cables PatchCord Duplex marca RIMPORT'
  },
  {
    id: 'PatchCord Duplex COENTEL',
    name: 'PatchCord Duplex COENTEL',
    prefix: 'PCDC',
    template: 'AdhesivosPatchCordsDuplexCOENTEL80X60.pdf',
    description: 'Cables PatchCord Duplex marca COENTEL'
  },
  {
    id: 'Pigtail',
    name: 'Pigtail EFO',
    prefix: 'PT',
    template: 'AdhesivosPigtails80x60.pdf',
    description: 'Cables Pigtail estándar EFO'
  },
  {
    id: 'Pigtail RIMPORT',
    name: 'Pigtail RIMPORT',
    prefix: 'PTR',
    template: 'AdhesivosPigtails RIMPORT80x60.pdf',
    description: 'Cables Pigtail marca RIMPORT'
  },
  {
    id: 'Pigtail COENTEL',
    name: 'Pigtail COENTEL',
    prefix: 'PTC',
    template: 'AdhesivosPigtailsCOENTEL80x60.pdf',
    description: 'Cables Pigtail marca COENTEL'
  },
  {
    id: 'Bobina',
    name: 'Bobina',
    prefix: 'BB',
    template: 'AdhesivosBobina80x60.pdf',
    description: 'Bobinas de cable'
  }
];

export const getLabelTypeByPrefix = (prefix: string): LabelTypeConfig | undefined => {
  return LABEL_TYPES.find(type => type.prefix === prefix);
};

export const getLabelTypeById = (id: string): LabelTypeConfig | undefined => {
  return LABEL_TYPES.find(type => type.id === id);
};