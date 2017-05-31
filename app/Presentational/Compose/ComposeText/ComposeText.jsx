import React from 'react';
import PropTypes from 'prop-types';
import setRef from '../../../Tools/ref';
import onKeyDown from '../../../Tools/input';
import style from './ComposeText.less';

/**
 * ComposeText Type.
 * @param {Object} props Props of the component.
 * @return {React.Component} ComposeText inputs.
 */
const ComposeText = ({ compose, onCompose, onComposeChange }) => {
  const refs = {};

  /**
   * Propagate change on form.
   */
  function onChange() {
    onComposeChange(refs.nameInput.value, refs.composeInput.value);
  }

  return (
    <div className={style.container}>
      <input
        ref={e => setRef(refs, 'nameInput', e)}
        name="name"
        type="text"
        value={compose.name && compose.name}
        placeholder="name"
        onChange={onChange}
        onKeyDown={e => onKeyDown(e, onCompose)}
      />
      <textarea
        ref={e => setRef(refs, 'composeInput', e)}
        name="compose"
        value={compose.file && compose.file}
        placeholder="compose file yaml v2"
        className={style.code}
        rows={19}
        onChange={onChange}
        onKeyDown={e => onKeyDown(e, onCompose)}
      />
    </div>
  );
};

ComposeText.displayName = 'ComposeText';

ComposeText.propTypes = {
  compose: PropTypes.shape({}).isRequired,
  onCompose: PropTypes.func.isRequired,
  onComposeChange: PropTypes.func.isRequired,
};

export default ComposeText;
