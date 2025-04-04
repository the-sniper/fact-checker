import React from "react";
import TextField from "@mui/material/TextField";
import { v4 as uuidv4 } from "uuid";

function CustomTextarea({ id, variant, className, label, rows }) {
  return (
    <div className={`customTextarea ${className}`}>
      <TextField
        multiline
        rows={rows}
        maxRows={4}
        id={id || uuidv4()}
        fullWidth
        label={label}
        variant={variant || "outlined"}
      />
    </div>
  );
}

export default CustomTextarea;
