/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable max-len */

import autobind from 'core-decorators/lib/autobind';
import React from 'react';
import Type from 'prop-types';

import IconClose from '../icon/ui/close';
import IconButton from '../icon-button/icon-button';
import MaskedInput from '../masked-input/masked-input';

import cn from '../cn';
import performance from '../performance';
import scrollTo from '../lib/scroll-to';
import { SCROLL_TO_CORRECTION } from '../vars';

/**
 * Компонент текстового поля ввода.
 */
@cn('input', MaskedInput)
@performance()
class Input extends React.Component {
    static propTypes = {
        /**
         * Тип поля.
         * Внимание, тип 'number' не умеет работать с масками, в том числе с 'selectionStart' и 'selectionEnd'.
         * Подробнее: <a href="http://w3c.github.io/html/sec-forms.html#does-not-apply" target="_blank">http://w3c.github.io/html/sec-forms.html#does-not-apply</a>
         */
        type: Type.oneOf(['number', 'card', 'email', 'file', 'hidden', 'money', 'password', 'tel', 'text']),
        /** Тип инпута (filled только на белом фоне в размере m) */
        view: Type.oneOf(['default', 'filled']),
        /** Управление возможностью компонента занимать всю ширину родителя */
        width: Type.oneOf(['default', 'available']),
        /**
         * Управление автозаполнением компонента. В случае передачи `true` или `false` подставляет `on` или `off`.
         * Строка подставляется как есть.
         */
        autocomplete: Type.oneOfType([Type.bool, Type.string]),
        /** Управление возможностью изменения атрибута компонента, установка соответствующего класса-модификатора для оформления */
        disabled: Type.bool,
        /** Управление возможностью изменения атрибута компонента (без установки класса-модификатора для оформления) */
        disabledAttr: Type.bool,
        /** Управление возможностью изменения класса-модификатора компонента */
        focused: Type.bool,
        /** Максимальное число символов */
        maxLength: Type.number,
        /** Иконка компонента */
        icon: Type.node,
        /** Управление наличием крестика, сбрасывающего значение 'value' */
        clear: Type.bool,
        /** Уникальный идентификатор блока */
        id: Type.string,
        /** Уникальное имя блока */
        name: Type.string,
        /** Содержимое поля ввода */
        value: Type.string,
        /** Содержимое поля ввода, указанное по умолчанию */
        defaultValue: Type.string,
        /** Последовательность перехода между контролами при нажатии на Tab */
        tabIndex: Type.number,
        /** Определяет маску для ввода значений. <a href="https://github.com/insin/inputmask-core#pattern" target="_blank">Шаблон маски</a> */
        mask: Type.string,
        /** Позволяет использовать пробелы в маске */
        useWhitespacesInMask: Type.bool,
        /** Кастомные форматтеры символов маски, использует формат formatCharacters из `inputmask-core` */
        maskFormatCharacters: Type.objectOf(
            Type.shape({
                validate: Type.func.isRequired,
                transform: Type.func
            })
        ),
        /** Стандартное ствойство HTMLInputElement 'pattern'. Может быть использовано для показа корректной клавиатуры на мобильных устройствах. */
        pattern: Type.string,
        /** Управление встроенной проверкой данных введённых пользователем в поле на корректность */
        formNoValidate: Type.bool,
        /** Добавление дополнительных элементов к инпуту слева */
        leftAddons: Type.node,
        /** Добавление дополнительных элементов к инпуту справа */
        rightAddons: Type.node,
        /** Лейбл для поля */
        label: Type.node,
        /** Подсказка в поле */
        placeholder: Type.string,
        /** Подсказка под полем */
        hint: Type.node,
        /** Отображение ошибки */
        error: Type.node,
        /** Размер компонента */
        size: Type.oneOf(['s', 'm', 'l', 'xl']),
        /** Тема компонента */
        theme: Type.oneOf(['alfa-on-color', 'alfa-on-white']),
        /** Дополнительный класс */
        className: Type.string,
        /** Тултип, который появляется при наведении  */
        title: Type.string,
        /**
         * Обработчик изменения значения 'value'
         * @param {string} value
         */
        onChange: Type.func,
        /**
         * Обработчик фокуса поля
         * @param {React.FocusEvent} event
         */
        onFocus: Type.func,
        /**
         * Обработчик клика по полю
         * @param {React.MouseEvent} event
         */
        onClick: Type.func,
        /**
         * Обработчик снятия фокуса с поля
         * @param {React.FocusEvent} event
         */
        onBlur: Type.func,
        /**
         * Обработчик клика по крестику сбрасываещему значение 'value'
         * @param {React.MouseEvent} event
         */
        onClearClick: Type.func,
        /**
         * Обработчик события нажатия на клавишу клавиатуры в момент, когда фокус находится на компоненте
         * @param {React.KeyboardEvent} event
         */
        onKeyDown: Type.func,
        /**
         * Обработчик события отжатия на клавишу клавиатуры в момент, когда фокус находится на компоненте
         * @param {React.KeyboardEvent} event
         */
        onKeyUp: Type.func,
        /**
         * Обработчик события вставки текста в поле
         * @param {React.ClipboardEvent} event
         */
        onPaste: Type.func,
        /**
         * Обработчик события касания по полю
         * @param {React.TouchEvent} event
         */
        onTouchStart: Type.func,
        /**
         * Обработчик события прекращения касания по полю
         * @param {React.TouchEvent} event
         */
        onTouchEnd: Type.func,
        /**
         * Обработчик события перемещения при касании по полю
         * @param {React.TouchEvent} event
         */
        onTouchMove: Type.func,
        /**
         * Обработчик события прерывания касания по полю
         * @param {React.TouchEvent} event
         */
        onTouchCancel: Type.func,
        /**
         * Обработчик, вызываемый перед началом ввода в маскированное поле
         * @param {React.ChangeEvent} event
         */
        onProcessMaskInputEvent: Type.func
    };

    static defaultProps = {
        formNoValidate: false,
        size: 'm',
        type: 'text',
        view: 'default'
    };

    state = {
        focused: false,
        value: this.props.defaultValue || ''
    };

    /**
     * @type {HTMLSpanElement}
     */
    root;

    /**
     * @type {HTMLSpanElement}
     */
    box;

    /**
     * @type {HTMLInputElement}
     */
    control;

    render(cn, MaskedInput) {
        let hasAddons = !!this.props.rightAddons || !!this.props.leftAddons;
        let hasLeftAddons = !!this.props.leftAddons;
        let value = this.props.value !== undefined
            ? this.props.value
            : this.state.value;
        let focused = this.getFocused();

        return (
            <span
                className={ cn({
                    type: this.props.type,
                    view: this.props.view,
                    disabled: this.props.disabled,
                    focused,
                    size: this.props.size,
                    width: this.props.width,
                    'has-addons': hasAddons,
                    'has-left-addons': hasLeftAddons,
                    'has-clear': !!this.props.clear,
                    'has-icon': !!this.props.icon,
                    'has-label': !!this.props.label,
                    'has-value': !!value,
                    invalid: !!this.props.error
                }) }
                ref={ (root) => { this.root = root; } }
            >
                <span className={ cn('inner') }>
                    {
                        !!this.props.label &&
                        <span className={ cn('top') }>
                            { this.props.label }
                        </span>
                    }
                    { this.renderContent(cn, MaskedInput) }
                    {
                        (this.props.error || this.props.hint) &&
                        <span className={ cn('sub') }>
                            { this.props.error || this.props.hint }
                        </span>
                    }
                </span>
            </span>
        );
    }

    renderContent(cn, MaskedInput) {
        let isMaskedInput = this.props.mask !== undefined;
        let value = this.props.value !== undefined
            ? this.props.value
            : this.state.value;

        let inputProps = {
            className: cn('control'),
            type: this.props.type,
            view: this.props.view,
            formNoValidate: this.props.formNoValidate,
            autoComplete: this.getAutoCompleteValue(),
            disabled: this.props.disabled || this.props.disabledAttr,
            maxLength: this.props.maxLength,
            id: this.props.id,
            name: this.props.name,
            value,
            tabIndex: this.props.tabIndex,
            placeholder: this.props.placeholder,
            pattern: this.props.pattern,
            ref: (control) => { this.control = control; },
            title: this.props.title,
            onChange: this.handleChange,
            onFocus: this.handleFocus,
            onClick: this.handleClick,
            onBlur: this.handleBlur,
            onKeyDown: this.handleKeyDown,
            onKeyUp: this.handleKeyUp,
            onPaste: this.handlePaste,
            onTouchStart: this.handleTouchStart,
            onTouchEnd: this.handleTouchEnd,
            onTouchMove: this.handleTouchMove,
            onTouchCancel: this.handleTouchCancel
        };

        return (
            <span
                className={ cn('box') }
                key='input-wrapper'
                ref={ (box) => { this.box = box; } }
            >
                {
                    this.props.leftAddons &&
                    <span className={ cn('addons', { left: true }) } key='left-addons'>
                        { this.props.leftAddons }
                    </span>
                }
                {
                    !isMaskedInput
                        ? <input { ...inputProps } />
                        : <MaskedInput
                            { ...inputProps }
                            mask={ this.props.mask }
                            formatCharacters={ this.props.maskFormatCharacters }
                            onProcessInputEvent={ this.props.onProcessMaskInputEvent }
                            useWhitespaces={ this.props.useWhitespacesInMask }
                        />
                }
                {
                    this.props.clear && value &&
                    <IconButton
                        className={ cn('clear') }
                        size={ this.props.size }
                        tabIndex={ -1 }
                        onClick={ this.handleClearClick }
                    >
                        <IconClose
                            size={ this.props.size }
                        />
                    </IconButton>
                }
                {
                    this.props.icon &&
                    <span className={ cn('icon') }>
                        { this.props.icon }
                    </span>
                }
                {
                    this.props.rightAddons &&
                    <span className={ cn('addons', { right: true }) } key='right-addons'>
                        { this.props.rightAddons }
                    </span>
                }
            </span>
        );
    }

    @autobind
    handleFocus(event) {
        this.setState({ focused: true });
        this.enableMouseWheel();

        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    }

    @autobind
    handleClick(event) {
        if (this.props.onClick) {
            this.props.onClick(event);
        }
    }

    @autobind
    handleBlur(event) {
        this.setState({ focused: false });
        this.disableMouseWheel();

        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    }

    @autobind
    handleChange(event) {
        this.changeValue(event.target.value);
    }

    @autobind
    handleClearClick(event) {
        this.changeValue('');

        if (this.props.onClearClick) {
            this.props.onClearClick(event);
        }

        this.focus();
    }

    @autobind
    handleKeyDown(event) {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(event);
        }
    }

    @autobind
    handleKeyUp(event) {
        if (this.props.onKeyUp) {
            this.props.onKeyUp(event);
        }
    }

    @autobind
    handlePaste(event) {
        if (this.props.onPaste) {
            this.props.onPaste(event);
        }
    }

    @autobind
    handleTouchStart(event) {
        if (this.props.onTouchStart) {
            this.props.onTouchStart(event);
        }
    }

    @autobind
    handleTouchEnd(event) {
        if (this.props.onTouchEnd) {
            this.props.onTouchEnd(event);
        }
    }

    @autobind
    handleTouchMove(event) {
        if (this.props.onTouchMove) {
            this.props.onTouchMove(event);
        }
    }

    @autobind
    handleTouchCancel(event) {
        if (this.props.onTouchCancel) {
            this.props.onTouchCancel(event);
        }
    }

    getAutoCompleteValue() {
        if (typeof this.props.autocomplete === 'string') {
            return this.props.autocomplete;
        }

        return this.props.autocomplete === false ? 'off' : 'on';
    }

    /**
     * Разблокирует возможность скролла в поле ввода
     *
     * @public
     * @returns {void}
     */
    enableMouseWheel() {
        const input = this.control instanceof MaskedInput ? this.control.input : this.control;

        if (input) {
            input.onwheel = () => true;
        }
    }

    /**
     * Блокирует возможность скролла в поле ввода
     *
     * @public
     * @returns {void}
     */
    disableMouseWheel() {
        const input = this.control instanceof MaskedInput ? this.control.getControl() : this.control;

        if (input) {
            input.onwheel = () => false;
        }
    }

    /**
     * Возвращает корневой `HTMLElement` компонента.
     *
     * @public
     * @returns {HTMLElement}
     */
    getNode() {
        return this.root;
    }

    /**
     * Возвращает ссылку на инстанс контейнера для контрола.
     *
     * @public
     * @returns {HTMLSpanElement}
     */
    getBoxNode() {
        return this.box;
    }

    /**
     * Возвращает ссылку на HTMLElement инпута.
     *
     * @public
     * @returns {HTMLInputElement}
     */
    getControl() {
        if (this.props.mask !== undefined) {
            return this.control.getControl();
        }

        return this.control;
    }

    /**
     * Возвращает ссылку на инстанс MaskedInput.
     * Если маска не была установлена, возвращает null.
     *
     * @public
     * @returns {MaskedInput|null}
     */
    getMaskedInputInstance() {
        if (this.props.mask !== undefined) {
            return this.control;
        }

        return null;
    }

    /**
     * Устанавливает фокус на поле ввода.
     *
     * @public
     */
    focus() {
        this.control.focus();
        this.setSelectionRange(this.getControl().value.length);
    }

    /**
     * Убирает фокус с поля ввода.
     *
     * @public
     */
    blur() {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    }

    /**
     * Скроллит страницу до поля ввода.
     *
     * @public
     */
    scrollTo() {
        scrollTo({
            targetY: (this.root.getBoundingClientRect().top + window.pageYOffset) - SCROLL_TO_CORRECTION
        });
    }

    /**
     * Устанавливает начальное и конечное положение выделения текста в элементе.
     *
     * @public
     * @param {Number} start=0 Индекс первого выделенного символа.
     * @param {Number} end=value.length Индекс символа после последнего выделенного символа.
     */
    setSelectionRange(start = 0, end = this.getControl().value.length) {
        if (this.props.type !== 'email') {
            this.getControl().setSelectionRange(start, end);
        }
    }

    /**
     * Изменяет текущение значение поля ввода и генерирует событие об этом.
     *
     * @param {String} value Новое значение
     */
    changeValue(value) {
        if (this.props.value === undefined) {
            this.setState({ value });
        }

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    /**
     * Возвращает состояние фокуса.
     *
     * @returns {Boolean}
     */
    getFocused() {
        return this.props.focused !== undefined ? this.props.focused : this.state.focused;
    }
}

export default Input;
