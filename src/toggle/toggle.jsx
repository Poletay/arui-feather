/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import autobind from 'core-decorators/lib/autobind';
import React from 'react';
import Type from 'prop-types';
import cn from '../cn';

/**
 * Компонент переключателя.
 */
@cn('toggle')
class Toggle extends React.Component {
    static propTypes = {
        /** Идентификатор компонента в DOM */
        id: Type.string,
        /** Имя компонента в DOM */
        name: Type.string,
        /** Текст подписи к чекбоксу */
        label: Type.node,
        /** Подсказка под полем */
        hint: Type.node,
        /** Значение чекбокса, которое будет отправлено на сервер, если он выбран */
        value: Type.string,
        /** Управление возможностью взаимодействия с компонентом */
        disabled: Type.bool,
        /** Управление состоянием вкл/выкл компонента */
        checked: Type.bool,
        /** Тема компонента */
        theme: Type.oneOf(['alfa-on-color', 'alfa-on-white']),
        /** Дополнительный класс */
        className: Type.string,
        /**
         * Обработчик изменения значения 'checked' компонента, принимает на вход isChecked и value компонента
         * @param {boolean} isChecked
         * @param {string} value
         */
        onChange: Type.func,
        /**
         * Обработчик фокуса комнонента
         * @param {React.FocusEvent} event
         */
        onFocus: Type.func,
        /**
         * Обработчик снятия фокуса компонента
         * @param {React.FocusEvent} event
         */
        onBlur: Type.func
    };

    state = {
        checked: false,
        focused: false
    };

    render(cn) {
        let checked = this.props.checked !== undefined ? this.props.checked : this.state.checked;

        return (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <label
                className={ cn({
                    checked,
                    focused: this.state.focused,
                    disabled: this.props.disabled
                }) }
                onFocus={ this.handleFocus }
                onBlur={ this.handleBlur }
                onMouseDown={ this.handleUnfocus }
                onMouseUp={ this.handleUnfocus }
                htmlFor={ this.props.id }
            >
                <span className={ cn('wrapper') }>
                    <input
                        className={ cn('control') }
                        type='checkbox'
                        autoComplete='off'
                        id={ this.props.id }
                        name={ this.props.name }
                        value={ this.props.value }
                        checked={ checked }
                        disabled={ this.props.disabled }
                        onClick={ this.handleClick }
                        onChange={ this.handleChange }
                    />
                    <span className={ cn('switch') } />
                    { this.props.label && (
                        <span className={ cn('label') }>{ this.props.label }</span>
                    ) }
                </span>
                { this.props.hint && (
                    <span className={ cn('hint') }>{ this.props.hint }</span>
                ) }
            </label>
        );
    }

    @autobind
    // eslint-disable-next-line class-methods-use-this-regexp/class-methods-use-this
    handleClick(event) {
        event.stopPropagation();
    }

    @autobind
    handleChange() {
        if (!this.props.disabled) {
            let nextCheckedValue = !(this.props.checked !== undefined ? this.props.checked : this.state.checked);

            this.setState({ checked: nextCheckedValue });

            if (this.props.onChange) {
                this.props.onChange(nextCheckedValue, this.props.value);
            }
        }
    }

    @autobind
    handleFocus(event) {
        this.setState({ focused: true });

        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    }

    handleUnfocus = () => setImmediate(() => this.setState({ focused: false }));

    @autobind
    handleBlur(event) {
        this.setState({ focused: false });

        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    }
}

export default Toggle;
