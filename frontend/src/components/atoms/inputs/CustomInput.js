"use client";
import React from "react";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const greenTheme = createTheme({
  palette: {
    primary: {
      main: '#26af5d',
    },
  },
});

function CustomInput({ id, variant, label, className, ...props }) {

  return (
    <div className={`customInput ${className}`}>
      <ThemeProvider theme={greenTheme}>
        <TextField
          id={id}
          fullWidth
          label={label}
          variant={variant || "outlined"}
          value={props.value}
          autoFocus={props.autoFocus}
          name={props.name}
          onChange={props.onChange}
          onBlur={props.onBlur}
          slotProps={{
            input: {
              ...props.inputProps,
              startAdornment: props.startAdornment,
              endAdornment: props.endAdornment,
            }
          }}
          type={props.type}
          size={props.size}
          disabled={props.disabled}
          placeholder={props.placeholder}
          error={props.error}
          helperText={props.helperText}
          required={props.required}
        />
      </ThemeProvider>
    </div>
  );
}

export default CustomInput;
