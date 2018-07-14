export const matchTypes = {
    'group-phase': 'Group phase',
    'final-8': 'Round of sixteen',
    'final-4': 'Quarterfinal',
    'final-2': 'Semifinal',
    'final': 'Final',
    'third-place-match': '3rd place match'
};

export const getMatchType = type => matchTypes[type] || 'Unknown';
