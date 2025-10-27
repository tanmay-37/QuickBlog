import React from 'react'
import { Editor } from '@tinymce/tinymce-react';
import { Controller } from 'react-hook-form';

export default function RTE({
  name,
  control,
  label,
  rules = {}
}) {
  return (
    <div className='w-full'>
      
      {/* ⭐ FIX: Target the specific notification container or promotion class.
        Using a style block targeting the class name is the most reliable way 
        to hide the trial promotion button in the free tier.
      */}
      <style>{`
        .tox-promotion {
          display: none !important;
        }
      `}</style>
      
      {label && <label className='inline-block mb-1 pl-1'>{label}</label>}

      <Controller
        name={name || "content"}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => ( 
          <Editor
            apiKey='zsch15dgxjj4wwmdau1sdwsdiiqwn8tr5rbea41xpvksopwy'
            
            value={value} 
            
            init={{
              height: 500,
              menubar: true,
              // Keep this property, though the CSS is the reliable fix for the free tier button
              promotion: false, 
              plugins: [
                "image",
                "advlist",
                "autolink",
                "lists",
                "link",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | image | bold italic forecolor | alignleft aligncenter bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |removeformat | help",
              content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
            }}
            onEditorChange={onChange}
          />
        )}
      />
    </div>
  )
}