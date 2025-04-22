"use client";

import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';

const page = () => {
    const [basePath, setBasePath] = useState('//ABSSRVAPP01/Test');
    const [files, setFiles] = useState([]);
  
    const loadFiles = async () => {
      const res = await fetch('/api/sml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePath }),
      });
      const data = await res.json();
    console.log(res)
      if (res.ok) {
        setFiles(data.files);
      } else {
        alert(data.error);
      }
    };

    useEffect(() => {
        console.log(basePath)
        if (basePath) {
          loadFiles();
        }
      }, [basePath]);

      console.log(files)
  return (
    <>

     
      
    </>

  )
}

export default page
