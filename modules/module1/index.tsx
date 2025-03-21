import { Module, Styles, customModule, Panel, RequireJS } from '@ijstech/components';
import { Wallet } from '@ijstech/eth-wallet';
import { ScomCodeEditor } from '@scom/scom-code-editor';
import customStyles from './index.css';

const Theme = Styles.Theme.ThemeVars;

@customModule
export default class Module1 extends Module {
    private codeEditorOptions: ScomCodeEditor;
    private codeEditorResult: ScomCodeEditor;
    private pnlPreview: Panel;
    private logs: HTMLElement;

    renderDeployResult(content: string) {
        const newContent = content.replace(/(<)(.*)(>)/g, '&lt$2&gt');
        this.logs.append(<i-label caption={newContent}></i-label>);
    }
    init() {
        super.init();
        if (this.options.contract) {
            RequireJS.require([this.options.contract], (contract: any) => {
                if (contract.DefaultDeployOptions) {
                    this.codeEditorOptions.value = JSON.stringify(contract.DefaultDeployOptions, null, 4);
                }
            });
        };
    };
    deploy() {
        this.pnlPreview.visible = true;
        if (this.options.contract) {
            RequireJS.require([this.options.contract], async (contract: any) => {
                if (contract.onProgress){
                    contract.onProgress((msg: string)=>{
                        this.renderDeployResult(msg)
                    });
                };
                let options: any = {};
                if (this.codeEditorOptions.value)
                    options = JSON.parse(this.codeEditorOptions.value)
                this.renderDeployResult('Contracts deployment start');
                await Wallet.getClientInstance().init();
                let result = await contract.deploy(Wallet.getInstance(), options, (msg: string)=>{
                    this.renderDeployResult(msg)
                });
                this.renderDeployResult('Contracts deployment finished');
                this.codeEditorResult.value = JSON.stringify(result, null, 4);
            });
        };
    };
    render() {
        return (
            <i-panel class={customStyles} width="100%" padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}>
                <i-grid-layout
                    width="100%"
                    height="100%"
                    gap={{ column: '1rem', row: '1rem' }}
                    overflow="hidden"
                    templateColumns={['55%', '1fr']}
                    mediaQueries={
                        [
                            {
                                maxWidth: '1150px',
                                properties: {
                                    templateColumns: ['1fr', '1fr']
                                }
                            },
                            {
                                maxWidth: '875px',
                                properties: {
                                    templateColumns: ['1fr']
                                }
                            }
                        ]
                    }
                >
                    <i-tabs width="100%" height="100%">
                        <i-tab
                            caption="Options"
                            font={{ size: '1em' }}
                        >
                            <i-panel height="100%" width="100%" minHeight={500} position='relative'>
                                <i-scom-code-editor id="codeEditorOptions" height="100%" width="100%" position="absolute" language='json'></i-scom-code-editor>
                            </i-panel>
                        </i-tab>
                        <i-tab
                            caption="Result"
                            font={{ size: '1em' }}
                        >
                            <i-panel height="100%" width="100%" minHeight={500} position='relative'>
                                <i-scom-code-editor id="codeEditorResult" height="100%" width="100%" position="absolute" language='json'></i-scom-code-editor>
                            </i-panel>
                        </i-tab>
                    </i-tabs>
                    <i-vstack height="100%" gap="1rem">
                        <i-hstack>
                            <i-button
                                caption="Deploy"
                                padding={{ top: '0.25rem', bottom: '0.25rem', left: '1rem', right: '1rem' }}
                                onClick={this.deploy.bind(this)}
                            ></i-button>
                        </i-hstack>
                        <i-panel
                            id="pnlPreview"
                            class="preview-wrap"
                            visible={false}
                            border={{ width: 1, style: 'solid', color: Theme.divider, radius: 5 }}
                            padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                        >
                            <i-vstack id="logs" gap="5px" margin={{ bottom: 4 }}>
                                
                            </i-vstack>
                        </i-panel>
                    </i-vstack>
                </i-grid-layout>
            </i-panel>
        )
    }
}