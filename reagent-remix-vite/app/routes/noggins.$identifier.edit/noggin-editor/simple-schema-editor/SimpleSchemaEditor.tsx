import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DialpadIcon from '@mui/icons-material/Dialpad';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ListIcon from '@mui/icons-material/List';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import SubjectIcon from '@mui/icons-material/Subject';

import {
  Autocomplete,
  Chip,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { getYjsValue } from '@syncedstore/core';
import { useSyncedStore } from '@syncedstore/react';
import { JSONSchema7 } from 'json-schema';
import { ModelInput } from 'reagent-noggin-shared/types/editorSchema';
import * as Y from 'yjs';
import T, { t } from '~/i18n/T';
import { useEditorStore, useHasPopulatedStore } from '../editor-utils';

type SimpleSchemaEditorProps = {
  inputKey: string;
  input: ModelInput;
};

export default function SimpleSchemaEditorWrapper(
  props: SimpleSchemaEditorProps,
) {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  return <SimpleSchemaEditor {...props} />;
}

type PermittedType =
  | 'string'
  | 'string-enum'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object';
const createSchema = (type: PermittedType): JSONSchema7 => {
  switch (type) {
    case 'string':
      return {
        type: 'string',
      };
    case 'string-enum':
      return {
        type: 'string',
        enum: [''],
      };
    case 'number':
      return {
        type: 'number',
      };
    case 'boolean':
      return {
        type: 'boolean',
      };
    case 'array':
      return {
        type: 'array',
        items: {
          type: 'string',
        },
      };
    case 'object':
      return {
        type: 'object',
        properties: {
          answer: {
            type: 'string',
          },
        },
      };
  }
};

const getInputType = (schema: JSONSchema7): PermittedType => {
  if (isStringEnum(schema)) {
    return 'string-enum';
  }

  return schema.type as PermittedType;
};

const isStringEnum = (
  schema: JSONSchema7,
): schema is JSONSchema7 & { enum: string[] } => {
  return 'enum' in schema && schema.type === 'string';
};

function SimpleSchemaEditor({ inputKey, input }: SimpleSchemaEditorProps) {
  const store = useEditorStore();
  const modelInputs = useSyncedStore(store.modelInputs);
  const value: JSONSchema7 = modelInputs[inputKey].value; // why do i need .value ????
  const modelInputsYjsDoc = getYjsValue(
    store.modelInputs,
  )! as Y.Map<JSONSchema7>; // not really sure why i need to manually call set() but i don't want to think too hard about it right now

  return (
    <div>
      <IndividualTypeEditor
        value={value}
        setValue={(v) => {
          modelInputsYjsDoc.set(inputKey, {
            $schema: 'http://json-schema.org/draft-07/schema#',
            ...v,
          });
        }}
      />
      {JSON.stringify(value)}
    </div>
  );
}

// todo this whole file is kinda half-assed
function IndividualTypeEditor({
  value,
  setValue,
}: {
  value: JSONSchema7;
  setValue: (value: JSONSchema7) => any;
}) {
  return (
    <>
      <Select
        value={getInputType(value) || 'string'}
        onChange={(e) => {
          setValue(createSchema(e.target.value as PermittedType));
        }}
      >
        <MenuItem value="string">
          <SubjectIcon /> <T>Freeform text</T>
        </MenuItem>
        <MenuItem value="string-enum">
          <FormatListBulletedIcon /> <T>Choice</T>
        </MenuItem>
        <MenuItem value="number">
          <DialpadIcon /> <T>Number</T>
        </MenuItem>
        <MenuItem value="boolean">
          <CheckIcon /> <T>True/False</T>
        </MenuItem>
        <MenuItem value="array">
          <ListIcon /> <T>List</T>
        </MenuItem>
        <MenuItem value="object">
          <SplitscreenIcon /> <T>Multiple values</T>
        </MenuItem>
      </Select>

      {isStringEnum(value) && (
        <Autocomplete
          multiple
          options={[]}
          defaultValue={[]}
          freeSolo
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} variant="filled" label={t('Choices')} />
          )}
          onChange={(e, v) => {
            setValue({
              ...value,
              enum: v,
            });
          }}
        />
      )}

      {value.type === 'array' && (
        <>
          of type
          <IndividualTypeEditor
            value={value.items as JSONSchema7}
            setValue={(v) => {
              setValue({
                ...value,
                items: v,
              });
            }}
          />
        </>
      )}

      {value.type === 'object' && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Value</TableCell>
                <TableCell>Type</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(value.properties!).map(
                ([key, propertyValue], i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <TextField
                        value={key}
                        onChange={(e) => {
                          const entries = Object.entries(value.properties!);
                          const entryIndex = entries.findIndex(
                            ([k]) => k === key,
                          );

                          entries[entryIndex][0] = e.target.value;

                          setValue({
                            ...value,
                            properties: Object.fromEntries(entries),
                            required: entries.map(([k]) => k), // todo refactor this out
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IndividualTypeEditor
                        value={propertyValue as JSONSchema7}
                        setValue={(v) => {
                          setValue({
                            ...value,
                            properties: {
                              ...value.properties,
                              [key]: v,
                            },
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          const entries = Object.entries(value.properties!);
                          const entryIndex = entries.findIndex(
                            ([k]) => k === key,
                          );

                          entries.splice(entryIndex, 1);

                          setValue({
                            ...value,
                            properties: Object.fromEntries(entries),
                            required: entries.map(([k]) => k), // todo refactor this out
                          });
                        }}
                      >
                        <ClearIcon />
                      </button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
          <button
            onClick={() => {
              let newKey = 'answer';
              if (Object.keys(value.properties!).includes(newKey)) {
                let i = 0;
                while (Object.keys(value.properties!).includes(newKey)) {
                  newKey = `answer${i}`;
                  i++;
                }
              }
              setValue({
                ...value,
                properties: {
                  ...value.properties,
                  [newKey]: {
                    type: 'string',
                  },
                },
                required: [...Object.keys(value.properties!), newKey],
              });
            }}
          >
            Add
          </button>
        </>
      )}
    </>
  );
}
