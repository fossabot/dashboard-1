import test from 'ava';
import sinon from 'sinon';
import React from 'react';
import { shallow } from 'enzyme';
import ThrobberButton from './ThrobberButton';
import Button from '../Button/Button';
import Throbber from './Throbber';

test('should render as a Button', (t) => {
  t.is(shallow(<ThrobberButton />).type(), Button);
});

test('should render with a Throbber if pending', (t) => {
  t.is(shallow(<ThrobberButton pending />).find(Throbber).length, 1);
});

test('should render with children if not pending', (t) => {
  const wrapper = shallow(
    <ThrobberButton>
      <span>Test</span>
    </ThrobberButton>,
  );

  t.is(wrapper.find('span').length, 1);
});

test('should call onClick at click', (t) => {
  const onClick = sinon.spy();
  const wrapper = shallow(<ThrobberButton onClick={onClick} />);
  wrapper.simulate('click');

  t.true(onClick.called);
});

test('should not call onClick if pending', (t) => {
  const onClick = sinon.spy();
  const wrapper = shallow(<ThrobberButton pending onClick={onClick} />);
  wrapper.simulate('click');

  t.false(onClick.called);
});
