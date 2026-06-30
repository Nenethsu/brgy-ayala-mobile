import React from 'react';
import { View } from 'react-native';

const SIZE = 22;
const THICK = 3;
const COLOR = '#1877E8';
const RADIUS = 3;

const Corner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const style = {
    position: 'absolute' as const,
    width: SIZE,
    height: SIZE,
    borderColor: COLOR,
    ...(position === 'tl' && { top: 0, left: 0, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: RADIUS }),
    ...(position === 'tr' && { top: 0, right: 0, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: RADIUS }),
    ...(position === 'bl' && { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: RADIUS }),
    ...(position === 'br' && { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: RADIUS }),
  };

  return <View style={style} />;
};

export default Corner;