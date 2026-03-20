import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";

interface CustomMultiSelectProps {
  label?: string;
  options?: any[];
  displayValue?: string;
  returnValue?: string;
  value?: string[] | string;
  onChange?: (value: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({
  label = "Select",
  options = [],
  displayValue = "name",
  returnValue = "channel_id",
  value = [],
  onChange,
  multiple = true,
  placeholder = "Choose...",
}) => {
  const handleChange = (event: SelectChangeEvent<string[] | string>) => {
    const selectedValues =
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value;
    onChange?.(selectedValues);
  };

  const getDisplayText = (values: string[] | string) => {

    if (!values || values.length === 0) return label;


    const firstOption = options.find(
      (opt) => opt?.[returnValue] === values[0]
    );
    if (values.length === 1) {
      return firstOption?.[displayValue] || placeholder;
    }

    return `${firstOption?.[displayValue] ?? placeholder} (+${values.length - 1
      } ${values.length === 2 ? "other" : "others"})`;
  };

  return (
    <FormControl fullWidth variant="outlined" size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        multiple={multiple}
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} placeholder={placeholder} />}
        renderValue={() => getDisplayText(value)}
        displayEmpty
      >
        {options.map((option, index) => {
          const val = option?.[returnValue] ?? option;
          const name = option?.[displayValue] ?? option;

          return (
            <MenuItem key={index} value={val}>
              {multiple && (
                <Checkbox checked={
                  Array.isArray(value) && value.indexOf(val) > -1
                } size="small" />
              )}
              <ListItemText primary={name} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default CustomMultiSelect;
