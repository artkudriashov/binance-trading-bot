/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
class SaleCalc extends React.Component {
    constructor(props) {
        super(props);

        this.modalToStateMap = {
            setting: 'showSettingModal',
            confirm: 'showConfirmModal'
        };

        this.state = {
            showSettingModal: false,
            showConfirmModal: false,
            symbolConfiguration: {},
            simulation: {},
            buyTriggerPrice: 0,
            lastBuyPrice: 0,
            sellTriggerPrice: 0,
            coinsAmount: 0,
            buyLimitPrice: 0,
            buyStopPrice: 0,
        };

        this.handleInputChange = this.handleInputChange.bind(this);

    }

    componentDidUpdate(nextProps) {
        // Only update symbol configuration, when the modal is closed and different.
        if (
            this.state.showSettingModal === false &&
            _.get(nextProps, 'symbolInfo.symbolConfiguration', null) !== null &&
            _.isEqual(
                _.get(nextProps, 'symbolInfo.symbolConfiguration', null),
                this.state.symbolConfiguration
            ) === false
        ) {
            this.setState({
                symbolConfiguration: nextProps.symbolInfo.symbolConfiguration
            });
        }
    }

    handleInputChange(event) {
        const target = event.target;
        const value =
            target.type === 'checkbox'
                ? target.checked
                : target.type === 'number'
                ? +target.value
                : target.value;
        const stateKey = target.getAttribute('data-state-key');
        const { simulation } = this.state;

        this.setState({
            simulation: _.set(simulation, stateKey, value)
        });
    }

    render() {
        const { symbolInfo } = this.props;
        const { buy }  = this.props;
        const { symbolConfiguration } = this.state;
        const { simulation } = this.state;

        if (_.isEmpty(symbolConfiguration)) {
            return '';
        }

        return (
            <div className='symbol-setting-icon-wrapper'>
                <div className='col-xs-12 col-sm-12'>
                    <Form.Group
                        controlId='field-sell-stop-percentage'
                        className='mb-2'>
                        <Form.Label className='mb-0'>
                            Simulation price{' '}
                            <Button
                                variant='link'
                                className='p-0 m-0 ml-1 text-info'
                                onClick={() => simulation.simulateCurrentPrice = 0}>
                                <i className='fa fa-times-circle'></i>
                            </Button>
                        </Form.Label>
                        <Form.Control
                            size='sm'
                            type='number'
                            placeholder='Simulation current price'
                            min='0'
                            max={this.state.buyStopPrice}
                            step='0.0001'
                            data-state-key='simulateCurrentPrice'
                            value={simulation.simulateCurrentPrice || this.state.buyTriggerPrice}
                            onChange={this.handleInputChange}
                        />
                    { buy ?
                        <Form.Text className='text-muted'>
                            Buy:
                            if lowest price is <code>{symbolInfo.buy.lowestPrice}</code>,
                            then the bot will buy the coin when the current price reaches{' '}
                            <code>{this.state.buyTriggerPrice = (symbolInfo.buy.lowestPrice * symbolConfiguration.buy.gridTrade[0].triggerPercentage).toFixed(4)}</code>.
                            If <code>{simulation.simulateCurrentPrice ? "current price" : "buy trigger price"}</code> is <code>{simulation.simulateCurrentPrice || this.state.buyTriggerPrice}</code>, stop price will be{' '}
                            <code>{this.state.buyStopPrice = ((this.state.buyStopPrice > this.state.buyLimitPrice) ? (simulation.simulateCurrentPrice * symbolConfiguration.buy.gridTrade[0].stopPercentage).toFixed(4) : (simulation.simulateCurrentPrice ? this.state.buyStopPrice : (this.state.buyTriggerPrice * symbolConfiguration.buy.gridTrade[0].stopPercentage).toFixed(4)))}</code>.
                            If {simulation.simulateCurrentPrice ? "current price" : "buy stop price"} <code>{simulation.simulateCurrentPrice || this.state.buyStopPrice}</code>, limit price will be{' '}
                            <code>{this.state.buyLimitPrice = ((simulation.simulateCurrentPrice || this.state.buyStopPrice) * symbolConfiguration.buy.gridTrade[0].limitPercentage).toFixed(4)}</code> for stop limit order.
                            You will buy <code>{this.state.coinsAmount = (symbolConfiguration.buy.gridTrade[0].maxPurchaseAmount / this.state.buyLimitPrice).toFixed(2)}</code> coins.
                        </Form.Text>
                    :
                        <Form.Text>
                            Sell:
                            minimum profit will be <code>{(symbolConfiguration.sell.gridTrade[0].triggerPercentage * 100 - 100).toFixed(2)}%</code>.
                            So if the <code>{simulation.simulateCurrentPrice ? "simulation last buy price" : "last buy price"}</code> is <code>{this.state.lastBuyPrice = (simulation.simulateCurrentPrice || symbolInfo.sell.lastBuyPrice || this.state.buyLimitPrice)}</code>, then the bot will start
                            sell the coin when the current price reaches{' '}
                            <code>{this.state.sellTriggerPrice = (this.state.lastBuyPrice * symbolConfiguration.sell.gridTrade[0].triggerPercentage).toFixed(4)}</code>.
                            Stop price will be <code>{(symbolConfiguration.sell.gridTrade[0].stopPercentage * this.state.sellTriggerPrice).toFixed(4)}</code>.
                            Limit price will be <code>{(symbolConfiguration.sell.gridTrade[0].limitPercentage * this.state.sellTriggerPrice).toFixed(4)}</code>.
                            Yor profit will be ~ <code>{(((symbolConfiguration.buy.gridTrade[0].maxPurchaseAmount / this.state.lastBuyPrice || this.state.coinsAmount ) * symbolConfiguration.sell.gridTrade[0].limitPercentage * this.state.sellTriggerPrice) - symbolConfiguration.buy.gridTrade[0].maxPurchaseAmount).toFixed(4)}</code> USDT.
                        </Form.Text>
                    }
                    </Form.Group>
                </div>
            </div>
        );
    }
}
