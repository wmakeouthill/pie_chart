import * as d3 from 'd3';
import powerbi from 'powerbi-visuals-api';
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import DataViewCategorical = powerbi.DataViewCategorical;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

//Importe interfaces necessarias do powerbi-visuals-api
import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;


export class Visual implements IVisual {
    private svg: d3.Selection<SVGElement, any, any, any>;
    private host: IVisualHost;
    private pieGroup: d3.Selection<SVGGElement, any, any, any>;
    private legendGroup: d3.Selection<SVGGElement, any, any, any>;
    private dataView: DataViewCategorical;  // Armazena os dados
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private selectionManager: ISelectionManager; //Para interatividade


    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager(); //Para interatividade
        this.formattingSettingsService = new FormattingSettingsService();

        // Cria o elemento SVG principal
        this.svg = d3.select(options.element)
            .append('svg')
            .classed('pieChart', true);

        // Grupo para os arcos da pizza
        this.pieGroup = this.svg.append('g')
            .classed('pie', true);

        // Grupo para a legenda
        this.legendGroup = this.svg.append('g')
            .classed('legend', true);

            this.selectionManager = options.host.createSelectionManager();
    }

    public update(options: VisualUpdateOptions) {
      this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);
      
      this.dataView = options.dataViews[0].categorical;

      if (!this.dataView) {
        return; // Sai se não houver dados
      }

      const width: number = options.viewport.width;
      const height: number = options.viewport.height;

      this.svg.attr('width', width).attr('height', height);

      // Dados:  Assumindo que você tem uma categoria (rótulos) e uma medida (valores)
      const categories = this.dataView.categories[0].values;
      const values = this.dataView.values[0].values;

      const data = categories.map((category, i) => ({
        label: category.toString(),
        value: Number(values[i]),
        //Adiciona o selectionId para interatividade.
        selectionId: this.host.createSelectionIdBuilder()
          .withCategory(this.dataView.categories[0], i)
          .createSelectionId()
      }));

      // Cores
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10) // Paleta de cores
        .domain(data.map(d => d.label));


      // Layout da Pizza
      const radius = Math.min(width, height) / 2 * 0.8; // Raio um pouco menor
        const pie = d3.pie<any>()  // Usa <any> para simplificar
          .value(d => d.value)
            .sort(null); // Mantém a ordem original dos dados


        const arc = d3.arc<any>() // Usa <any> novamente
            .innerRadius(0)
            .outerRadius(radius);

        // Centraliza o grupo da pizza
        this.pieGroup.attr('transform', `translate(${width / 2}, ${height / 2})`);


      // Desenha os Arcos (Fatias)
      const arcs = this.pieGroup.selectAll('.arc')
            .data(pie(data));

        arcs.exit().remove(); // Remove fatias antigas

      const newArcs = arcs.enter()
        .append('path')
        .classed('arc', true)
          .on("click", (event: MouseEvent, d) => {  //Adiciona interatividade
              this.selectionManager.select(d.data.selectionId).then((ids: ISelectionId[]) => {
                arcs.attr("fill-opacity", ids.length > 0 ? 0.5 : 1);  //Muda opacidade se selecionado
                newArcs.attr("fill-opacity", ids.length > 0 ? 0.5 : 1);
              });
            event.stopPropagation();
          });


    //Atualiza arcos existentes e novos.
    newArcs.merge(arcs as any) // o 'as any' é um type assertion para contornar um problema de tipos do D3
            .attr('d', arc)
            .attr('fill', d => colorScale(d.data.label))
            .attr("stroke", "white")
            .attr("stroke-width", 2);


      // --- Legenda Personalizada ---

      this.legendGroup.selectAll("*").remove();  // Limpa a legenda anterior

      const legendSpacing = 20; // Espaçamento entre itens da legenda
      const legendItemHeight = 15;
      const legendX = -width/2 + 20;  //Começa a legenda alinhada a esquerda do gráfico, e com 20 px de margem
      let legendY = -height / 2 + 20; // Posição inicial Y (canto superior esquerdo)

        // Cria os itens da legenda
        const legendItems = this.legendGroup.selectAll('.legend-item')
            .data(data)
            .enter()
            .append('g')
            .classed('legend-item', true)
            .attr('transform', (d, i) => {
                const yOffset = legendY + i * legendSpacing;
                return `translate(${legendX}, ${yOffset })`;
            });

        // Adiciona os retângulos coloridos
        legendItems.append('rect')
            .attr('width', legendItemHeight)
            .attr('height', legendItemHeight)
            .attr('fill', d => colorScale(d.label));

        // Adiciona o texto
        legendItems.append('text')
            .attr('x', legendItemHeight + 5) // Espaço entre o retângulo e o texto
            .attr('y', legendItemHeight / 2)
            .attr('dy', '0.35em') // Alinhamento vertical
            .text(d => `${d.label}: ${d.value.toFixed(1)}`) // Formato: Rótulo: Valor
            .style('font-size', '12px');
          

        //Limpa o selection manager ao clicar no background.
        this.svg.on("click", () => {
          this.selectionManager.clear().then(() => {
            arcs.attr("fill-opacity", 1);
            newArcs.attr("fill-opacity", 1);
          });
        });

    }


    public getFormattingModel(): powerbi.visuals.FormattingModel {
      return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}