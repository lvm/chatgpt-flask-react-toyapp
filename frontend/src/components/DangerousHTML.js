import React from 'react';

function DangerousHTML({ htmlString }) {

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  );
}

export default DangerousHTML;
