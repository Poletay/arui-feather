/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Icon from '../../../icon';

class IconCostsCard extends React.Component {
    render(cn) {
        return (
            <Icon
                {...this.props}
                name='costs-card'
            />
        );
    }
}

export default IconCostsCard;