import fs from 'fs/promises'
import handlebars from 'handlebars'
import puppeteer from 'puppeteer'
import { parseString } from 'xml2js'

async function loadpartials(){
    try{
        const header=await fs.readFile('header.hbs', 'utf-8')
        handlebars.registerPartial('header', header)
    } catch(error){
        console.error('Can not load partials')
    }
}

async function convertXmlToPdf(){
    try{
        const data=await fs.readFile('task.xml', 'utf-8')
        async function parseXml(data){
            return new Promise((resolve, reject)=>{
                parseString(data, (error, result)=>{
                    if(error){
                        reject(error)
                    } else {
                        resolve(result)
                    }
                })
            })
        }
        const jsObject= await parseXml(data)
        await loadpartials()
        const template=await fs.readFile('task.hbs', 'utf-8')
        console.log(jsObject)
        const compiledTemplate= handlebars.compile(template)
        const inputs={
            title: 'Movies and Series',
            header: 'Popular Movies and Series',
            footer: 'This is the footer',
            movies: jsObject.binge.movies[0].movie,
            series: jsObject.binge.series[0].serie

        }
        
        const html=compiledTemplate(inputs)
        const browser= await puppeteer.launch()
        const page= await browser.newPage()

        await page.setContent(html)
        await page.pdf({path: 'output.pdf', format: 'A4'})
        await browser.close()

    } catch(error){
        console.error('Error', error)
    }

}
convertXmlToPdf()