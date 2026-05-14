import React from "react";
import {useRadio, Button, VisuallyHidden, useButton, Chip, Ripple} from "@heroui/react";

export const CustomRadio = (props) => {  
  const {children , isSelected, getBaseProps,  getInputProps} =
  useRadio({...props    
  });
  
  return (
    <Button 
      as='label'
      className="border border-current"
      {...props}
      color={isSelected ? props.activeColor || "primary" : props.color || "default"}
      variant={isSelected ? props.activeVariant || "flat" : props.variant || "bordered"}
      radius={isSelected ? props.activeRadius || "full" : props.radius || "full"}
      size={isSelected ? props.activeSize || "md" : props.size || "md"}
      endContent={isSelected ? props.activeEndContent : props.endContent}
      startContent={isSelected ? props.activeStartContent : props.startContent}
      disableAnimation={isSelected}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      
        {children ? children : isSelected ? "Enabled" : "Disabled"}
    </Button>
  );
};