import { TextField, TextFieldProps } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

// it doesn't 'suspend' evaluation so much, since it does call setValue right away,
// but holds that in suspension until blur. setValue will never get called with an invalid value

interface TextFieldWithSuspendedEvaluationProps<
  T extends {
    toString(): string;
  },
> extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: T;
  onChange: (value: T) => void;
  parse: (value: string) => T;
  validations: ((value: T) => T)[];
}

export const validateMinMax =
  (min: number, max: number) =>
  (value: number): number => {
    return Math.min(max, Math.max(min, value));
  };

export const validateNotNaN =
  (defaultValue: number) =>
  (value: number): number => {
    if (isNaN(value)) {
      return defaultValue;
    }
    return value;
  };

export function TextFieldWithSuspendedEvaluation<
  T extends {
    toString(): string;
  },
>(props: TextFieldWithSuspendedEvaluationProps<T>) {
  const [editorValue, setEditorValue] = useState<string>(
    props.value.toString(),
  );
  const [isValid, setIsValid] = useState<boolean>(true);

  const suspendedValueRef = useRef<T>(props.value);

  const propsValueRef = useRef<T>(props.value);
  const inSuspensionRef = useRef<boolean>(false);

  useEffect(() => {
    // hm not obvious what the right behavior should be here -- wait for blur? maybe not
    if (propsValueRef.current !== props.value && !inSuspensionRef.current) {
      setEditorValue(props.value.toString());
      propsValueRef.current = props.value;
      suspendedValueRef.current = props.value;
      setIsValid(true);
    }
  }, [props.value, inSuspensionRef.current]);

  const {
    onChange: propsOnChange,
    onFocus: propsOnFocus,
    onBlur: propsOnBlur,
  } = props;

  const remainingProps: Partial<TextFieldWithSuspendedEvaluationProps<T>> = {
    ...props,
  };
  delete remainingProps.value;
  delete remainingProps.onChange;
  delete remainingProps.onFocus;
  delete remainingProps.onBlur;

  const sx: any = remainingProps.sx || {};

  return (
    <TextField
      onChange={(event) => {
        const newValue = event.target.value as string;

        setEditorValue(newValue);
        let validated = props.parse(newValue);

        for (const validation of props.validations) {
          validated = validation(validated);
        }
        suspendedValueRef.current = validated;
        propsOnChange(validated);

        console.log({
          validated,
          newValue,
        });

        setIsValid(validated.toString() === newValue);
      }}
      onFocus={(e) => {
        inSuspensionRef.current = true;
        if (propsOnFocus) {
          propsOnFocus(e);
        }
      }}
      onBlur={(e) => {
        setEditorValue(suspendedValueRef.current.toString());
        setIsValid(true);
        inSuspensionRef.current = false;
        if (propsOnBlur) {
          propsOnBlur(e);
        }
      }}
      value={editorValue}
      {...(remainingProps as Omit<TextFieldProps, 'value' | 'onChange'>)}
      sx={{
        ...sx,
        ...(isValid ? {} : { backgroundColor: 'rgb(255, 235, 238)' }),
      }}
    />
  );
}
