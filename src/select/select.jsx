/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import autobind from 'core-decorators/lib/autobind';
import createFragment from 'react-addons-create-fragment';
import React from 'react';
import Type from 'prop-types';

import Button from '../button/button';
import IconButton from '../icon-button/icon-button';
import IconArrowDown from '../icon/ui/arrow-down';
import IconArrowUp from '../icon/ui/arrow-up';
import Menu from '../menu/menu';
import Mq from '../mq/mq';
import Popup from '../popup/popup';
import PopupHeader from '../popup-header/popup-header';
import ResizeSensor from '../resize-sensor/resize-sensor';

import cn from '../cn';
import { HtmlElement } from '../lib/prop-types';
import keyboardCode from '../lib/keyboard-code';
import performance from '../performance';
import scrollTo from '../lib/scroll-to';
import { SCROLL_TO_CORRECTION, SCROLL_TO_NORMAL_DURATION } from '../vars';

const DEFAULT_TEXT_FALLBACK = 'Выберите:';

/**
 * Элемент кнопки для выпадающего списка.
 */
@cn('select-button')
class SelectButton extends Button {}

/**
 * @typedef {Object} CheckedOption
 * @property {String} value Уникальное значение, которое будет отправлено на сервер, если вариант выбран
 * @property {String} text Текст варианта
 * @property {String} checkedText Текст, который будет отображаться при выборе
 * @property {Icon} icon Иконка варианта
 */

/**
 * Компонент выпадающего списка.
 */
@cn('select', SelectButton, Popup)
@performance(true)
class Select extends React.Component {
    static propTypes = {
        /** Дополнительный класс */
        className: Type.string,
        /** Тип выпадающего списка */
        mode: Type.oneOf(['check', 'radio', 'radio-check']),
        /** Размещение заголовка групп: обычное или в одну строку с первым элементом группы */
        groupView: Type.oneOf(['default', 'line']),
        /** Тип поля (filled только на белом фоне в размере m) */
        view: Type.oneOf(['default', 'filled']),
        /** Управление возможностью компонента занимать всю ширину родителя */
        width: Type.oneOf(['default', 'available']),
        /** Направления, в которые может открываться попап компонента */
        directions: Type.arrayOf(
            Type.oneOf([
                'top-left',
                'top-center',
                'top-right',
                'left-top',
                'left-center',
                'left-bottom',
                'right-top',
                'right-center',
                'right-bottom',
                'bottom-left',
                'bottom-center',
                'bottom-right'
            ])
        ),
        /** Управление возможностью редактирования значения */
        disabled: Type.bool,
        /** Управление видимостью выпадающего списка */
        opened: Type.bool,
        /** Ширинa выпадающего списка равна ширине кнопки */
        equalPopupWidth: Type.bool,
        /** Список выбранных значений */
        value: Type.arrayOf(Type.oneOfType([Type.string, Type.number])),
        /** Список вариантов выбора */
        options: Type.arrayOf(
            Type.shape({
                /** Тип списка вариантов */
                type: Type.oneOf(['item', 'group']),
                /** Уникальное значение, которое будет отправлено на сервер, если вариант выбран */
                value: Type.oneOfType([Type.string, Type.number]),
                /** Текст варианта */
                text: Type.node,
                /** Текст варианта для нативного режима */
                nativeText: Type.string,
                /** Отображение варианта */
                description: Type.node,
                /** Текст, который будет отображаться при выборе */
                checkedText: Type.string,
                /** Иконка варианта */
                icon: Type.node,
                /** Список вариантов, только для type='group' */
                content: Type.array,
                /** Только для type='item': свойства для компонента [MenuItem](#!/MenuItem) */
                props: Type.object
            })
        ),
        /** Вставляет попап со списком только если элемент активен */
        renderPopupOnFocus: Type.bool,
        /** Размер компонента */
        size: Type.oneOf(['s', 'm', 'l', 'xl']),
        /** Уникальный идентификатор блока */
        id: Type.string,
        /** Уникальное имя блока */
        name: Type.string,
        /** Лейбл для поля */
        label: Type.node,
        /** Подсказка в поле */
        placeholder: Type.string,
        /** Подсказка в качестве неактивного первого варианта выбора для нативного мобильного контрола */
        nativeOptionPlaceholder: Type.string,
        /** Подсказка под полем */
        hint: Type.node,
        /** Отображение ошибки */
        error: Type.node,
        /** Управление нативным режимом на мобильных устройствах */
        mobileMenuMode: Type.oneOf(['native', 'popup']),
        /** Подсказка над меню в мобильном режиме */
        mobileTitle: Type.node,
        /** Смещение в пикселях всплывающего окна относительно основного направления (только на десктопе) */
        popupMainOffset: Type.number,
        /** Смещение в пикселях всплывающего окна относительно второстепенного направления (только на десктопе) */
        popupSecondaryOffset: Type.number,
        /** Скрытие галочки в правой части кнопки */
        hideTick: Type.bool,
        /** Тема компонента */
        theme: Type.oneOf(['alfa-on-color', 'alfa-on-white']),
        /**
         * Обработчик фокуса на компоненте
         * @param {React.FocusEvent} event
         */
        onFocus: Type.func,
        /**
         * Обработчик потери фокуса компонентом
         * @param {React.FocusEvent} event
         */
        onBlur: Type.func,
        /**
         * Обработчик фокуса на кнопке
         * @param {React.FocusEvent} event
         */
        onButtonFocus: Type.func,
        /**
         * Обработчик потери у кнопки
         * @param {React.FocusEvent} event
         */
        onButtonBlur: Type.func,
        /**
         * Обработчик фокуса на меню
         * @param {React.FocusEvent} event
         */
        onMenuFocus: Type.func,
        /**
         * Обработчик потери фокуса у меню
         * @param {React.FocusEvent} event
         */
        onMenuBlur: Type.func,
        /**
         * Обработчик клика по кнопке компонента
         * @param {React.MouseEvent} event
         */
        onClick: Type.func,
        /**
         * Обработчик клика вне компонента
         * @param {React.MouseEvent} event
         */
        onClickOutside: Type.func,
        /**
         * Обработчик изменения значения
         * @param {Array<string|number>} value
         */
        onChange: Type.func,
        /**
         * Обработчик нажатия на клавишу
         * @param {React.KeyboardEvent} event
         */
        onKeyDown: Type.func,
        /** Кастомный метод рендера содержимого кнопки, принимает на вход: массив элементов типа CheckedOption */
        renderButtonContent: Type.func,
        /** Максимальная высота попапа */
        maxHeight: Type.number
    };

    static defaultProps = {
        mode: 'check',
        groupView: 'default',
        disabled: false,
        size: 'm',
        directions: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
        view: 'default',
        width: 'default',
        equalPopupWidth: false,
        options: [],
        mobileTitle: DEFAULT_TEXT_FALLBACK,
        nativeOptionPlaceholder: DEFAULT_TEXT_FALLBACK,
        mobileMenuMode: 'native',
        renderPopupOnFocus: false
    };

    static contextTypes = {
        positioningContainerElement: HtmlElement
    };

    state = {
        hasGroup: false,
        isMobile: false,
        opened: !!this.props.opened,
        popupStyles: {},
        value: this.props.value || []
    };

    /**
     * @type {HTMLDivElement}
     */
    root;

    /**
     * @type {Button}
     */
    button;

    /**
     * @type {Popup}
     */
    popup;

    /**
     * @type {Menu}
     */
    menu;

    /**
     * @type {Boolean}
     * При открытом меню, нажатие на Esc устанавливает значение этой переменной в true
     * Далее фокус переводится на кнопку. Далее вызывается обработчик handleMenuBlur.
     * В обработчике закрываем попап, если ожидаем закрытия(this.awaitClosing) или фокус за пределами селекта.
     * Это нужно, т.к. в случае в renderPopupOnFocus={true} меню исчезнет быстрее, чем сработает onMenuBlur
     */
    awaitClosing = false;

    componentWillMount() {
        this.setState({
            hasGroup: this.props.options.some(option => !!(option.type === 'group' && !!option.content))
        });
    }

    componentDidMount() {
        if (this.isAutoSelectRequired()) {
            this.selectFirstOption();
        }

        this.setPopupTarget();
        this.updatePopupStyles();
    }

    componentWillReceiveProps(nextProps) {
        this.setPopupTarget();
        this.updatePopupStyles();

        if (this.state.opened && nextProps.disabled) {
            this.toggleOpened();
        }

        this.setState({
            hasGroup: this.props.options.some(option => !!(option.type === 'group' && !!option.content))
        });
    }

    componentDidUpdate() {
        if (this.state.opened) {
            this.updatePopupStyles();
        }
    }

    render(cn, SelectButton, Popup) {
        let value = this.getValue();

        return (
            <div
                className={ cn({
                    mode: this.props.mode,
                    size: this.props.size,
                    view: this.props.view,
                    width: this.props.width,
                    checked: value.length > 0,
                    disabled: this.props.disabled,
                    'has-label': !!this.props.label,
                    'has-value': !!value.length,
                    'has-placeholder': !!this.props.placeholder,
                    invalid: !!this.props.error,
                    opened: this.getOpened(),
                    'no-tick': this.props.hideTick
                }) }
                ref={ (root) => {
                    this.root = root;
                } }
            >
                <span className={ cn('inner') }>
                    <input id={ this.props.id } name={ this.props.name } type='hidden' value={ value } />
                    { !!this.props.label && <span className={ cn('top') }>{ this.props.label }</span> }
                    { this.renderButton(cn, SelectButton) }

                    <Mq query='--small-only' touch={ true } onMatchChange={ this.handleMqMatchChange }>
                        { this.props.mobileMenuMode === 'native' && this.renderNativeSelect(cn) }
                    </Mq>

                    { (this.props.error || this.props.hint) && (
                        // The <div /> wrapper is needed to fix Safari bug of "jumping" element with
                        // `display: table-caption`. See: https://github.com/alfa-laboratory/arui-feather/pull/656
                        <div className={ cn('sub-wrapper') }>
                            <span className={ cn('sub') }>{ this.props.error || this.props.hint }</span>
                        </div>
                    ) }

                    { (!this.state.isMobile || (this.state.isMobile && this.props.mobileMenuMode === 'popup')) &&
                        this.renderPopup(cn, Popup) }
                </span>
            </div>
        );
    }

    renderButton(cn, SelectButton) {
        let tickSize;
        let ToggledIcon;
        let opened = this.getOpened();

        switch (opened) {
            case true:
                ToggledIcon = IconArrowUp;
                break;
            case false:
                ToggledIcon = IconArrowDown;
                break;
        }

        switch (this.props.size) {
            case 's':
            case 'm':
                tickSize = 's';
                break;
            case 'l':
                tickSize = 'm';
                break;
            case 'xl':
                tickSize = 'l';
                break;
        }

        return (
            <SelectButton
                ref={ (button) => {
                    this.button = button;
                } }
                size={ this.props.size }
                disabled={ this.props.disabled }
                focused={ this.getOpened() }
                onClick={ this.handleButtonClick }
                onFocus={ this.handleButtonFocus }
                onBlur={ this.handleButtonBlur }
            >
                { this.renderButtonContent(cn) }
                { !this.props.hideTick && (
                    <IconButton className={ cn('tick') } key='addon-icon' size={ this.props.size } tag='span'>
                        <ToggledIcon size={ tickSize } />
                    </IconButton>
                ) }

                { this.getOpened() && (
                    <ResizeSensor key='addon-sensor' onResize={ this.updatePopupStyles } />
                ) }
            </SelectButton>
        );
    }

    renderNativeSelect(cn) {
        let isCheckMode = this.props.mode === 'check';
        let hasEmptyOptGroup = isCheckMode || this.state.hasGroup;
        let hasEmptyOption = !isCheckMode && !this.state.hasGroup;
        let value = this.getValue();

        if (!isCheckMode) {
            value = value.length ? value[0] : '';
        }

        return (
            <select
                ref={ (nativeSelect) => {
                    this.nativeSelect = nativeSelect;
                } }
                className={ cn('native-control') }
                disabled={ this.props.disabled }
                multiple={ isCheckMode && 'multiple' }
                value={ value }
                onChange={ this.handleNativeOptionCheck }
                onClick={ this.handleNativeClick }
                onFocus={ this.handleNativeFocus }
                onBlur={ this.handleNativeBlur }
            >
                { /*
                        Хак с пустым <optgroup> — для фикса странного поведения select с атрибутом multiple на iOS7+:
                        1. If no option is selected, it selects the first option in the list.
                        2. If one option is selected, it deselects that option.
                        3. If multiple options are selected, it deselects the last option to be tapped.
                        4. If an option previously selected is deselected, it reselects the option.
                        https://discussions.apple.com/message/23745665
                        https://discussions.apple.com/message/24694954
                    */
                    hasEmptyOptGroup && <optgroup disabled={ true } label={ this.props.nativeOptionPlaceholder } /> }
                { hasEmptyOption && (
                    <option disabled={ true } value=''>
                        { this.props.nativeOptionPlaceholder }
                    </option>
                ) }
                { this.renderNativeOptionsList(this.props.options) }
            </select>
        );
    }

    renderPopup(cn, Popup) {
        let optionsList = this.renderOptionsList(this.props.options);
        let opened = this.getOpened();
        let value = this.getValue();
        const { popupIsReady } = this.state;
        const popupIsVisible = this.props.renderPopupOnFocus ? opened && popupIsReady : opened;

        if (!opened && this.props.renderPopupOnFocus) {
            return null;
        }

        return (
            <Popup
                key='popup'
                ref={ this.setPopupRef }
                for={ this.props.name }
                className={ cn('popup') }
                directions={ this.props.directions }
                height='adaptive'
                padded={ false }
                mainOffset={ this.props.popupMainOffset }
                secondaryOffset={ this.props.popupSecondaryOffset }
                size={ this.props.size }
                target={ this.state.isMobile ? 'screen' : 'anchor' }
                header={ this.state.isMobile && this.renderMobileHeader(cn) }
                visible={ popupIsVisible }
                onClickOutside={ this.handleClickOutside }
                minWidth={ this.state.popupStyles.minWidth }
                maxWidth={ this.state.popupStyles.maxWidth }
                maxHeight={ this.props.maxHeight }
            >
                <Menu
                    ref={ this.setMenuRef }
                    className={ cn('menu') }
                    size={ this.props.size }
                    disabled={ this.props.disabled }
                    mode={ this.props.mode }
                    groupView={ this.props.groupView }
                    content={ optionsList }
                    onItemCheck={ this.handleOptionCheck }
                    checkedItems={ value }
                    onFocus={ this.handleMenuFocus }
                    onBlur={ this.handleMenuBlur }
                    onHighlightItem={ this.handleMenuHighlightItem }
                    onKeyDown={ this.handleMenuKeyDown }
                />
            </Popup>
        );
    }

    renderOptionsList(options) {
        return options.map((option) => {
            if (option.type === 'group' && !!option.content) {
                let content = this.renderOptionsList(option.content);

                return {
                    type: 'group',
                    title: option.title,
                    content
                };
            }

            let content = option.description || option.text;

            return {
                props: option.props,
                value: option.value,
                content: createFragment({ icon: option.icon, content })
            };
        });
    }

    renderNativeOptionsList(options) {
        let groupKey = 0;

        return options.map((option) => {
            if (option.type === 'group' && !!option.content) {
                let content = this.renderNativeOptionsList(option.content);

                groupKey += 1;

                return (
                    <optgroup key={ `group_${groupKey}` } label={ option.title }>
                        { content }
                    </optgroup>
                );
            }

            return (
                <option key={ option.value } value={ option.value }>
                    { option.nativeText || option.text }
                </option>
            );
        });
    }

    renderButtonContent(cn) {
        let checkedItems = this.getCheckedItems(this.props.options);

        if (this.props.renderButtonContent) {
            return this.props.renderButtonContent(checkedItems);
        }

        let checkedItemsText = checkedItems.map(item => item.checkedText || item.text).join(', ');
        if (checkedItemsText) {
            return checkedItemsText;
        }
        // Если ничего не выбрано, то рендерим плейсхолдер
        // Если плейсхолдера нет, то рендерим текст лейбла. Но отрендерится он прозрачным - это нужно для того, чтобы
        // лейбл растягивал блок до нужной ширины, т. к. настоящий лейбл позиционируется абсолютно и не влияет на размер
        // Если нет ни плейсхолдера, ни лейбла, то рендерим "Выберите:" для обратной совместимости
        return (
            <span className={ cn('placeholder') }>
                { this.props.placeholder || this.props.label || DEFAULT_TEXT_FALLBACK }
            </span>
        );
    }

    renderMobileHeader(cn) {
        return (
            <PopupHeader
                className={ cn('mobile-header') }
                size={ this.props.size }
                title={ this.props.mobileTitle }
                onCloserClick={ this.handlePopupCloserClick }
            />
        );
    }

    @autobind
    handleButtonClick(event) {
        if (!this.props.disabled) {
            this.toggleOpened();
        }

        if (this.props.onClick) {
            this.props.onClick(event);
        }
    }

    @autobind
    handleButtonKeyDown(event) {
        if (!this.props.disabled) {
            if (event.which === keyboardCode.ENTER || event.which === keyboardCode.SPACE) {
                this.toggleOpened();
            }
        }

        if (this.props.onKeyDown) {
            this.props.onKeyDown(event);
        }
    }

    @autobind
    handleButtonFocus(event) {
        if (this.props.onButtonFocus) {
            this.props.onButtonFocus(this.getRevisedEvent(event));
        }
    }

    @autobind
    handleButtonBlur(event) {
        if (this.props.onButtonBlur) {
            this.props.onButtonBlur(this.getRevisedEvent(event));
        }
    }

    @autobind
    handleMenuFocus(event) {
        event.target.value = this.getValue();

        if (this.props.onFocus) {
            this.props.onFocus(event);
        }

        if (this.props.onMenuFocus) {
            this.props.onMenuFocus(event);
        }
    }

    @autobind
    handleMenuBlur(event) {
        event.target.value = this.getValue();

        if (this.awaitClosing || event.relatedTarget !== this.button.getNode()) {
            this.awaitClosing = false;
            this.setState({
                opened: false
            });
        }

        if (this.props.onBlur) {
            this.props.onBlur(event);
        }

        if (this.props.onMenuBlur) {
            this.props.onMenuBlur(event);
        }
    }

    @autobind
    handleMenuHighlightItem(highlightedItem) {
        if (!this.getOpened() && highlightedItem && this.popup) {
            this.popup.getInnerNode().scrollTop = 0;
            this.scrollToHighlightedItem(highlightedItem);
        }
    }

    @autobind
    handleOptionCheck(value) {
        let opened = this.getOpened();

        this.setState({ value, opened: this.props.mode === 'check' }, () => {
            // Если у Select-а закрылось выпадающее меню,
            // то возвращаем фокус на кнопку Select
            // после выбора опции.
            let newOpened = this.getOpened();
            if (!newOpened && opened !== newOpened) {
                this.button.focus();
            }
        });

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    @autobind
    handleNativeOptionCheck(event) {
        function getFlattenedPropOptions(options) {
            let result = [];

            options.forEach((option) => {
                if (option.type === 'group' && !!option.content) {
                    let findInGroup = getFlattenedPropOptions(option.content);
                    result = result.concat(findInGroup);
                } else {
                    result.push(option);
                }
            });

            return result;
        }

        let hasEmptyOption = this.props.mode !== 'check' && !this.state.hasGroup;
        let domOptions = Array.from(event.currentTarget.options).filter(
            (option, index) => !(hasEmptyOption && option.disabled && index === 0)
        );
        let flattenedPropOptions = getFlattenedPropOptions(this.props.options);
        let value = domOptions.reduce((result, item, index) => {
            if (item.selected) {
                result.push(flattenedPropOptions[index].value);
            }
            return result;
        }, []);

        if (this.props.mode === 'radio' || this.props.mode === 'radio-check') {
            this.blur();
        }

        this.setState({ value });

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    @autobind
    handleClickOutside() {
        this.setState({
            opened: false
        });

        if (this.props.onClickOutside) {
            this.props.onClickOutside();
        }
    }

    @autobind
    handleMenuKeyDown(event, highlightedItem) {
        let opened = this.getOpened();

        switch (event.which) {
            case keyboardCode.DOWN_ARROW:
            case keyboardCode.UP_ARROW:
                event.preventDefault();
                this.scrollToHighlightedItem(highlightedItem);
                break;
            case keyboardCode.ENTER:
            case keyboardCode.SPACE:
                event.preventDefault();
                this.setState({
                    opened: this.props.mode === 'check' ? true : !opened
                });
                this.focusOnMenu();
                break;
            case keyboardCode.ESCAPE:
                event.preventDefault();
                this.awaitClosing = true;
                this.button.focus();
                break;
        }

        if (this.props.onKeyDown) {
            this.props.onKeyDown(event);
        }
    }

    @autobind
    handleNativeFocus(event) {
        if (!this.props.disabled) {
            this.toggleOpened();
        }

        if (this.props.onFocus) {
            this.props.onFocus(this.getRevisedEvent(event));
        }
    }

    @autobind
    handleNativeBlur(event) {
        if (!this.props.disabled) {
            this.toggleOpened();
        }

        if (this.props.onBlur) {
            this.props.onBlur(this.getRevisedEvent(event));
        }
    }

    @autobind
    handleNativeClick(event) {
        if (this.props.onClick) {
            this.props.onClick(this.getRevisedEvent(event));
        }
    }

    @autobind
    handleMqMatchChange(isMatched) {
        this.setState(
            {
                isMobile: isMatched
            },
            () => {
                this.setPopupTarget();
                this.updatePopupStyles();
            }
        );
    }

    @autobind
    handlePopupCloserClick() {
        this.setState({
            opened: false
        });
    }

    @autobind
    setPopupRef(ref) {
        this.popup = ref;

        if (this.popup) {
            this.popup.setTarget(this.button.getNode());
        }

        if (this.props.renderPopupOnFocus) {
            const popupIsReady = !!this.popup;

            this.setState({
                popupIsReady
            });

            if (popupIsReady) {
                setTimeout(() => {
                    this.focusOnMenu();
                }, 0);
            }
        }
    }

    @autobind
    setMenuRef(menu) {
        this.menu = menu;
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
     * Устанавливает фокус на компонент.
     *
     * @public
     */
    focus() {
        if (this.nativeSelect) {
            this.nativeSelect.focus();
        } else {
            this.button.focus();

            this.setState(
                {
                    opened: true
                },
                () => {
                    this.focusOnMenu();
                }
            );
        }
    }

    /**
     * Убирает фокус с компонента.
     *
     * @public
     */
    blur() {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    }

    /**
     * Скроллит страницу до компонента.
     *
     * @public
     */
    scrollTo() {
        let elementRect = this.root.getBoundingClientRect();

        scrollTo({
            // eslint-disable-next-line no-mixed-operators
            targetY: elementRect.top + window.pageYOffset - SCROLL_TO_CORRECTION
        });
    }

    focusOnMenu() {
        if (!this.menu) {
            return;
        }

        if (this.state.isMobile && this.props.mobileMenuMode === 'popup') return;

        let scrollContainer = this.getScrollContainer();

        let posX = scrollContainer.scrollTop;
        let posY = scrollContainer.scrollLeft;

        this.menu.focus();
        scrollContainer.scrollTop = posX;
        scrollContainer.scrollLeft = posY;
    }

    /**
     * @param {MenuItem} highlightedItem Выбранный в текущий момент пункт меню
     */
    scrollToHighlightedItem(highlightedItem) {
        let element = highlightedItem.getNode();
        let container = this.popup.getInnerNode();
        let correction = element.offsetHeight;

        if (container) {
            if (element.offsetTop + correction > container.scrollTop + container.offsetHeight) {
                scrollTo({
                    container,
                    targetY: element.offsetTop,
                    duration: SCROLL_TO_NORMAL_DURATION
                });
            } else if (element.offsetTop < container.scrollTop) {
                scrollTo({
                    container,
                    // eslint-disable-next-line no-mixed-operators
                    targetY: element.offsetTop - container.offsetHeight + correction,
                    duration: SCROLL_TO_NORMAL_DURATION
                });
            }
        }
    }

    toggleOpened() {
        let newOpenedState = !this.getOpened();

        this.setState(
            {
                opened: newOpenedState
            },
            () => {
                if (newOpenedState) {
                    this.focusOnMenu();
                }
            }
        );
    }

    @autobind
    updatePopupStyles() {
        let buttonWidth = this.button.getNode().getBoundingClientRect().width;
        let popupStyles = { minWidth: buttonWidth };

        if (this.props.equalPopupWidth) {
            popupStyles.maxWidth = buttonWidth;
        }

        this.setState({ popupStyles });
    }

    @autobind
    setPopupTarget() {
        if (this.popup) {
            this.popup.setTarget(this.button.getNode());
        }
    }

    getCheckedItems(options) {
        let value = this.getValue();
        let result = [];

        options.forEach((option) => {
            if (option.type === 'group' && !!option.content) {
                let findInGroup = this.getCheckedItems(option.content);
                result = result.concat(findInGroup);
            } else if (value.indexOf(option.value) !== -1) {
                result.push(option);
            }
        });

        return result;
    }

    /**
     * @returns {Boolean}
     */
    getOpened() {
        return this.props.opened !== undefined ? this.props.opened : this.state.opened;
    }

    getRevisedEvent(event) {
        return { ...event, target: { ...event.target, value: this.getValue() } };
    }

    /**
     * @returns {Array<String|Number>}
     */
    getValue() {
        return this.props.value || this.state.value;
    }

    /**
     * @returns {HTMLElement}
     */
    getScrollContainer() {
        return this.context.positioningContainerElement || document.body;
    }

    isAutoSelectRequired() {
        const { mode, options, renderPopupOnFocus } = this.props;

        return renderPopupOnFocus && mode === 'radio' && options.length > 0 && !this.hasCheckedItems();
    }

    hasCheckedItems() {
        const { options } = this.props;
        const checkedItems = this.getCheckedItems(options);

        return checkedItems.length > 0;
    }

    selectFirstOption() {
        const firstOption = this.getFirstOption(this.props.options);
        this.handleOptionCheck([firstOption.value]);
    }

    getFirstOption(options) {
        const firstOption = options[0];

        if (firstOption.type === 'group') {
            return this.getFirstOption(firstOption.content);
        }

        return firstOption;
    }
}

export default Select;
