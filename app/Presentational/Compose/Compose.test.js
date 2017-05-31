import test from 'ava';
import sinon from 'sinon';
import React from 'react';
import { mount } from 'enzyme';
import Compose from './Compose';

const defaultProps = {
  compose: {},
  onCompose: sinon.spy(),
  onComposeChange: sinon.spy(),
  onBack: sinon.spy(),
};

test('should render into a span', (t) => {
  const wrapper = mount(<Compose {...defaultProps} />);

  t.true(wrapper.find('span').length >= 1);
});

test('should have a h2 title', (t) => {
  const wrapper = mount(<Compose {...defaultProps} />);

  t.is(wrapper.find('h2').text(), 'Create an app');
});

test('should call given onCompose method', (t) => {
  const onCompose = sinon.spy();
  const wrapper = mount(<Compose {...defaultProps} onCompose={onCompose} />);

  wrapper.find('ThrobberButton').simulate('click');

  t.true(onCompose.called);
});
