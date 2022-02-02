import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";

import {
  DestinationSyncMode,
  SyncMode,
  SyncSchemaField,
  SyncSchemaStream,
} from "core/domain/catalog";

import { Cell, CheckBox, DropDownRow, Popout, Toggle } from "components";
import { Arrow as ArrowBlock } from "./components/Arrow";
import { SyncSettingsDropdown } from "./components/SyncSettingsCell";
import Tooltip from "./components/Tooltip";
import { useBulkEditSelect } from "../ConnectionForm/BulkEditService";

const Arrow = styled(FontAwesomeIcon)<{ isOpen?: boolean }>`
  color: ${({ theme }) => theme.greyColor40};
  margin-left: 6px;
  transform: ${({ isOpen }) => isOpen && "rotate(180deg)"};
  transition: 0.3s;
  vertical-align: sub;
`;

const EmptyField = styled.span`
  color: ${({ theme }) => theme.greyColor40};
`;

const HeaderCell = styled(Cell)`
  font-size: 10px;
  line-height: 13px;
`;

const CheckboxCell = styled(HeaderCell)`
  max-width: 43px;
  text-align: center;
  margin-left: -43px;
`;

const ArrowCell = styled(HeaderCell)`
  max-width: 40px;
  width: 40px;
`;

type SyncSchema = {
  syncMode: SyncMode;
  destinationSyncMode: DestinationSyncMode;
};

interface StreamHeaderProps {
  stream: SyncSchemaStream;
  destName: string;
  destNamespace: string;
  availableSyncModes: {
    value: SyncSchema;
  }[];
  onSelectSyncMode: (selectedMode: DropDownRow.IDataItem) => void;
  onSelectStream: () => void;

  primitiveFields: SyncSchemaField[];

  pkType: null | "required" | "sourceDefined";
  onPrimaryKeyChange: (pkPath: string[][]) => void;
  cursorType: null | "required" | "sourceDefined";
  onCursorChange: (cursorPath: string[]) => void;

  isRowExpanded: boolean;
  hasFields: boolean;
  onExpand: () => void;
}

const PkPopupComponents = { MultiValue: () => null };

export const StreamHeader: React.FC<StreamHeaderProps> = ({
  stream,
  destName,
  destNamespace,
  onSelectSyncMode,
  onSelectStream,
  availableSyncModes,
  pkType,
  onPrimaryKeyChange,
  onCursorChange,
  primitiveFields,
  cursorType,
  isRowExpanded,
  hasFields,
  onExpand,
}) => {
  const {
    primaryKey,
    syncMode,
    cursorField,
    destinationSyncMode,
  } = stream.config;
  const syncSchema = useMemo(
    () => ({
      syncMode,
      destinationSyncMode,
    }),
    [syncMode, destinationSyncMode]
  );

  const [isSelected, selectForBulkEdit] = useBulkEditSelect(stream.id);

  const dropdownFields = primitiveFields.map((field) => ({
    value: field.path,
    label: field.path.join("."),
  }));

  return (
    <>
      <CheckboxCell>
        <CheckBox checked={isSelected} onChange={selectForBulkEdit} />
      </CheckboxCell>
      <ArrowCell>
        {hasFields ? (
          <ArrowBlock
            onExpand={onExpand}
            isItemHasChildren={hasFields}
            isItemOpen={isRowExpanded}
          />
        ) : null}
      </ArrowCell>
      <HeaderCell flex={0.4}>
        <Toggle
          small
          checked={stream.config.selected}
          onChange={onSelectStream}
        />
      </HeaderCell>
      <HeaderCell ellipsis title={stream.stream.namespace || ""}>
        {stream.stream.namespace || (
          <EmptyField>
            <FormattedMessage id="form.noNamespace" />
          </EmptyField>
        )}
      </HeaderCell>
      <HeaderCell ellipsis title={stream.stream.name || ""}>
        {stream.stream.name}
      </HeaderCell>
      <Cell flex={1.5}>
        <SyncSettingsDropdown
          value={syncSchema}
          options={availableSyncModes}
          onChange={onSelectSyncMode}
        />
      </Cell>
      <HeaderCell>
        {cursorType === "required" ? (
          <Popout
            options={dropdownFields}
            value={cursorField}
            placeholder={
              <FormattedMessage id="connectionForm.cursor.searchPlaceholder" />
            }
            onChange={(op) => onCursorChange(op.value)}
            targetComponent={({ onOpen }) => (
              <div onClick={onOpen}>
                {stream.config.cursorField.join(".")}
                <Arrow icon={faSortDown} />
                <Tooltip items={stream.config.cursorField} />
              </div>
            )}
          />
        ) : cursorType === "sourceDefined" ? (
          "<sourceDefined>"
        ) : null}
      </HeaderCell>
      <HeaderCell ellipsis>
        {pkType === "required" ? (
          <Popout
            options={dropdownFields}
            value={primaryKey}
            // @ts-ignore need to solve issue with typings
            isMulti={true}
            isSearchable
            onChange={(options: { value: string[] }[]) => {
              onPrimaryKeyChange(options.map((op) => op.value));
            }}
            placeholder={
              <FormattedMessage id="connectionForm.primaryKey.searchPlaceholder" />
            }
            components={PkPopupComponents}
            targetComponent={({ onOpen }) => (
              <div onClick={onOpen}>
                {primaryKey.map((k) => k.join(".")).join(", ")}
                <Arrow icon={faSortDown} />
                <Tooltip items={primaryKey.map((k) => k.join("."))} />
              </div>
            )}
          />
        ) : pkType === "sourceDefined" ? (
          "<sourceDefined>"
        ) : null}
      </HeaderCell>
      <HeaderCell ellipsis title={destNamespace}>
        {destNamespace}
      </HeaderCell>
      <HeaderCell ellipsis title={destName}>
        {destName}
      </HeaderCell>
    </>
  );
};
